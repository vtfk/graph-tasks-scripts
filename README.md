# graph-tasks-scripts
A collection of useful/not useful scripts to do queries against Microsoft Graph API

# Set up
- Clone the repository to a place you want to run scripts from
- Set up a .env file with required values
```
GRAPH_CLIENT_ID=client-id from app reg
GRAPH_CLIENT_SECRET=client-secret from app reg
GRAPH_TENANT_ID=your tenant-id
GRAPH_SCOPE=https://graph.microsoft.com/.default or something else you need
```
# Scripts
## GetAllTeams (currently gets all groups...)
[Script GetAllTeams](/scripts/Microsoft%20Teams/getAllTeams/index.js)

- Set up config if you need something else than default
- Run from VSCode (insert image)
- Result is found in result folder within [Script directory](/scripts/Microsoft%20Teams/getAllTeams)

# TODO: How to create a new script
