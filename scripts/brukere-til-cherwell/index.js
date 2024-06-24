(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { appendFileSync, existsSync, mkdirSync, writeFileSync } = require('fs')
  const { pagedGraphRequest } = require('../../lib/graphRequest')
  const { STUDENT_UPN_SUFFIX } = require('./config')
  const axios = require('axios').default
  const { unparse } = require('papaparse')
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
    prefix: 'Brukere-til-cherwell',
    teams: {
      onlyInProd: false
    },
    localLogger
  })

  logger('info', ['Starting new run'])


  const resource = `users?$filter=UserType eq 'Member' and accountEnabled eq true and endsWith(userPrincipalName, '${STUDENT_UPN_SUFFIX}')&$select=id,displayName,givenName,surName,userPrincipalName,mailNickname,companyName,department,jobTitle,extension_0fe49c4c681d427aa4cad2252aba12f5_employeeNumber&$top=999&$count=true`
  const graphOptions = {
    onlyFirstPage: false,
    advanced: true
  }
  let students
  try {
    students = await pagedGraphRequest(resource, graphOptions)
  } catch (error) {
    logger('error', ['Failed when fetching users from graph', error.response?.data || error.stack || error.toString()])
    process.exit(1)
  }
  let mappedStudents
  try {
    logger('info', ['Mapping users'])
    mappedStudents = students.value.map(student => {
      let type
      if (student.jobTitle === 'Elev'){type = 'Student'}
      else if (student.jobTitle === 'Ansatt') {type = 'Employee'} 
      else {type = 'Student'}
      return {
        EmployeeType: type, // JobTitle
        //Id: student.id, // her kan vi bruke objektid fra aad
        LastName: student.surname,
        FirstName: student.givenName,
        DisplayName: student.displayName, // bruker DisplayName
        Company: student.companyName, // CompanyName
        Department: student.department, // Department
        Email: student.userPrincipalName,
        // EmailPrefix: student.mailNickname,
        // Role: student.jobTitle, // JobTitle
        // EmployeeNumber: student.extension_0fe49c4c681d427aa4cad2252aba12f5_employeeNumber || 'missing employeeNumber from Graph'
      }
    })
    logger('info', ['Finished mapping users'])
    logger('info', ['filtering users'])
    mappedStudents = mappedStudents.filter(student => student.LastName && student.FirstName)
    logger('info', ['finished filtering users'])
    const res = { count: mappedStudents.length, value: mappedStudents }
    if (!existsSync(`${__dirname}/result`)) mkdirSync(`${__dirname}/result`)
    writeFileSync(`${__dirname}/result/users-filtered.json`, JSON.stringify(res, null, 2))
    const csv = unparse(mappedStudents, {
      delimiter: ','
    })
    writeFileSync(`${__dirname}/result/users-filtered.csv`, csv)
  } catch (error) {
    logger('error', ['Failed when mapping users', error.response?.data || error.stack || error.toString()])
    process.exit(1)
  }

})()
