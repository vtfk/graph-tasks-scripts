
(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { appendFileSync, existsSync, mkdirSync } = require('fs')
  const { pagedGraphRequest } = require('../../lib/graphRequest')
  const { Parser } = require('@json2csv/plainjs')
  const writeResult = require('../../lib/writeResult')

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
    prefix: 'all-teams-to-csv',
    teams: {
      onlyInProd: false
    },
    localLogger
  })

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

  const mailStartsWith = 'section_2526'
  const createdOnOrAfterDateTime = '2025-08-14T00:00:00Z'

  logger('info', ['Starting new run'])
  logger('info', [`Finding groups where mail startsWith: '${mailStartsWith}' and createdDateTime >= ${createdOnOrAfterDateTime}`])

  const resource = `groups?$filter=startsWith(mail,'${mailStartsWith}') and createdDateTime ge ${createdOnOrAfterDateTime}&$select=id,displayName,mail,createdDateTime&$count=true&$top=999`
  const graphOptions = {
    onlyFirstPage: false,
    advanced: true
  }
  try {
    const groups = await pagedGraphRequest(resource, graphOptions)
    logger('info', [`Got ${groups.value.length} groups that starts with "${mailStartsWith}" and created >= "${createdOnOrAfterDateTime}" from graph`])
    
    const parser = new Parser()
    const csvCreatedOnOrAfterDateTime = parser.parse(groups.value)
    writeResult(__dirname, `${(new Date()).toLocaleDateString("nb-NO")}-createdOnOrAfterDateTime_${createdOnOrAfterDateTime.replaceAll(':','')}.csv`, csvCreatedOnOrAfterDateTime)
  } catch (error) {
    logger('error', ['Failed when fetching groups from graph', error.response?.data || error.stack || error.toString()])
    process.exit(1)
  }
})()
