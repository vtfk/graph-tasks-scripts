(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { appendFileSync, existsSync, mkdirSync, writeFileSync } = require('fs')
  const { pagedGraphRequest } = require('../../lib/graphRequest')
  const { EMPLOYEE_UPN_SUFFIX } = require('./config')

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
    prefix: 'Ansattoversikt-til-nettside',
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

  const resource = `users?$filter=UserType eq 'Member' and endsWith(userPrincipalName, '${EMPLOYEE_UPN_SUFFIX}')&$select=id,displayName,userPrincipalName,mailNickname,companyName,department,jobTitle,onPremisesDistinguishedName,mobilePhone,businessPhones&$top=999&$count=true`
  const graphOptions = {
    onlyFirstPage: false,
    advanced: true
  }
  try {
    const employees = await pagedGraphRequest(resource, graphOptions)
    const OUs = []
    const filtered = employees.value.filter(emp => {
      return emp.onPremisesDistinguishedName && emp.onPremisesDistinguishedName.includes('AUTO USERS') && emp.companyName
    })

    const res = { count: filtered.length, value: filtered }
    writeFileSync(`${__dirname}/users-filtered.json`, JSON.stringify(res, null, 2))
  } catch (error) {
    logger('error', ['Failed when fetching users from graph', error.response?.data || error.stack || error.toString()])
  }

})()