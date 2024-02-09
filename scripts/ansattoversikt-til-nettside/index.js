(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { appendFileSync, existsSync, mkdirSync, writeFileSync } = require('fs')
  const { pagedGraphRequest } = require('../../lib/graphRequest')
  const { EMPLOYEE_UPN_SUFFIX, prokomApiURL, prokomApiKey } = require('./config')
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

  const resource = `users?$filter=UserType eq 'Member' and accountEnabled eq true and endsWith(userPrincipalName, '${EMPLOYEE_UPN_SUFFIX}')&$select=id,displayName,userPrincipalName,mailNickname,companyName,department,jobTitle,onPremisesDistinguishedName,mobilePhone,businessPhones&$top=999&$count=true`
  const graphOptions = {
    onlyFirstPage: false,
    advanced: true
  }
  let filteredEmployees
  try {
    const employees = await pagedGraphRequest(resource, graphOptions)
    logger('info', ['Filtering users from the graph response'])
    filteredEmployees = employees.value.filter(emp => {
      return emp.onPremisesDistinguishedName && emp.onPremisesDistinguishedName.includes('AUTO USERS') && emp.companyName && !emp.onPremisesDistinguishedName.includes('OU=TEST')
    })
    logger('info', ['Finished filtering users from the grapg response'])
    // Writes to file
    // const res = { count: filteredEmployees.length, value: filteredEmployees }
    // writeFileSync(`${__dirname}/users-filtered.json`, JSON.stringify(res, null, 2))
  } catch (error) {
    logger('error', ['Failed when fetching users from graph', error.response?.data || error.stack || error.toString()])
    process.exit(1)
  }
  let mappedEmployees
  try {
    logger('info', ['Mapping users'])
    mappedEmployees = filteredEmployees.map(emp => {
      const businessPhone = Array.isArray(emp.businessPhones) && emp.businessPhones.length > 0 ? emp.businessPhones[0] : null
      const email = emp.onPremisesDistinguishedName.includes('OU=VTFK') ? `${emp.mailNickname}@vtfk.no` : emp.userPrincipalName
      return {
        Id: emp.id, // her kan vi bruke objektid fra aad
        Name: emp.displayName, // bruker DisplayName
        Phone: businessPhone,
        Mobile: emp.mobilePhone, // Vi bruker Mobile her
        Email: email, // Her må vi mappe - sjekker onPremisesDistinguishedName for hvilket OU - deretter mailnickname + suffix for hvilket OU man kommer fra (VTFK eller TFK eller VFK)
        Organization: emp.companyName, // CompanyName
        Subdivision: emp.department, // Department
        Role: emp.jobTitle, // JobTitle
        OfficeAddress: null,
        PostalCode: null,
        Assignment: null
      }
    })
    logger('info', ['Finished mapping users'])
    const res = { count: mappedEmployees.length, value: mappedEmployees }
    if (!existsSync(`${__dirname}/result`)) mkdirSync(`${__dirname}/result`)
    writeFileSync(`${__dirname}/result/users-filtered.json`, JSON.stringify(res, null, 2))
  } catch (error) {
    logger('error', ['Failed when mapping users', error.response?.data || error.stack || error.toString()])
    process.exit(1)
  }

  try {
    logger('info', ['Sending userinfo to prokom'])
    await axios.post(prokomApiURL, mappedEmployees, { headers: { Authorization: `Bearer ${prokomApiKey}` } })
    logger('info', ['Finished sending users to prokom'])
  } catch (error) {
    logger('error', ['Failed when sending data to prokom', error.response?.data || error.stack || error.toString()])
    process.exit(1)
  }
})()
