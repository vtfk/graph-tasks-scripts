require('dotenv').config()

module.exports = {
  // EMPLOYEE_UPN_SUFFIX: process.env.EMPLOYEE_UPN_SUFFIX || '@company.com',
  STUDENT_UPN_SUFFIX: process.env.STUDENT_UPN_SUFFIX || '@company.com',
  BRUKERE_TIL_CHERWELL_RESULT_DESTINATION_PATH: process.env.BRUKERE_TIL_CHERWELL_RESULT_DESTINATION_PATH || false
}
