
(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { appendFileSync, existsSync, mkdirSync, writeFileSync } = require('fs')
  const { pagedGraphRequest } = require('../../lib/graphRequest')
  const axios = require('axios').default

  const LOG_DIR = `${__dirname}/logs`
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR)
  const today = new Date()
  const month = today.getMonth() + 1 > 9 ? `${today.getMonth() + 1}` : `0${today.getMonth() + 1}`
  const logName = `${today.getFullYear()} - ${month}`

  const localLogger = (entry) => {
    console.log(entry)
    if (LOG_DIR) {
      appendFileSync(`${LOG_DIR}/${logName}.log`, `${entry}\n`)
    }
  }
  logConfig({
    prefix: 'SDS-not-teamified',
    teams: {
      onlyInProd: false
    },
    localLogger
  })

  logger('info', ['Starting new run'])

  /*
  Hent alle ansatte fra GRAPH - drit i elever og eksterne og gjester
  Overføre data fra nye tenants Azure AD / Entra id
[
  {
    "Id": "string", her kan vi bruke objektid fra aad
    "Name": "string", bruker DisplayName
    "Phone": "string",
    "Mobile": "string", Vi bruker Mobile her
    "Email": "string", Her må vi mappe - sjekker onPremisesDistinguishedName for hvilket OU - deretter mailnickname + suffix for hvilket OU man kommer fra (VTFK eller TFK eller VFK)
    "Organization": "string", CompanyName
    "Subdivision": "string", Department
    "Role": "string", JobTitle
    "OfficeAddress": "string",
    "PostalCode": "string",
    "Assignment": "string"
  }
]
  */

  const resource = `groups?$filter=startsWith(mail,'section')&$select=id,displayName,mail,resourceProvisioningOptions&$expand=owners($select=userPrincipalName,displayName,state)&$count=true&$top=999`
  const graphOptions = {
    onlyFirstPage: false,
    advanced: true
  }
  try {
    const groups = await pagedGraphRequest(resource, graphOptions)
    logger('info', [`Got ${groups.value.length} groups that starts with "section" from graph`])
    const notTeamified = groups.value.filter(group => !group.resourceProvisioningOptions.includes('Team'))
    logger('info', [`Got ${notTeamified.length} not teamified groups`])
    const res = { count: notTeamified.length, value: notTeamified }
    writeFileSync(`${__dirname}/not-teamified.json`, JSON.stringify(res, null, 2))
  } catch (error) {
    logger('error', ['Failed when fetching groups from graph', error.response?.data || error.stack || error.toString()])
    process.exit(1)
  }
})()
