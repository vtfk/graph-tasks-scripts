require('dotenv').config()

module.exports = {
  graphClient: {
    clientId: process.env.GRAPH_CLIENT_ID ?? 'superId',
    clientSecret: process.env.GRAPH_CLIENT_SECRET ?? 'hemmelig hemmelig',
    tenantId: process.env.GRAPH_TENANT_ID ?? 'tenant id',
    scope: process.env.GRAPH_SCOPE ?? 'etSkikkeligSkuup',
    baseurl: process.env.GRAPH_URL ?? 'https://graph.microsoft.com'
  }
}