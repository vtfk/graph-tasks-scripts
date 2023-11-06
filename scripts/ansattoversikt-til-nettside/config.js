require('dotenv').config()

module.exports = {
  EMPLOYEE_UPN_SUFFIX: process.env.EMPLOYEE_UPN_SUFFIX || '@company.com',
  prokomApiURL: process.env.PROKOM_API ?? 'en api url :)',
  prokomApiKey: process.env.PROKOM_KEY ?? 'ogga bogga'
}
