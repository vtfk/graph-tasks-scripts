require('dotenv').config()

module.exports = {
  EMPLOYEE_UPN_SUFFIX: process.env.EMPLOYEE_UPN_SUFFIX || '@company.com'
}