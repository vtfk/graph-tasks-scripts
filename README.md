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
[Script GetAllTeams](/scripts/getAllTeams/index.js)

- Set up config if you need something else than default
- Run from VSCode

![image](https://user-images.githubusercontent.com/25528003/222729900-f563bff2-7a1b-453e-a1bb-7d66e2a80dbb.png)
- Result is found in result folder within [Script directory](/scripts/getAllTeams)

## ansattoversikt-til-nettside (currently gets all groups...)
[Script ansattoversikt-til-nettside](/scripts/ansattoversikt-til-nettside/index.js)

- Set up config if you need something else than default
- Run from VSCode

![image](https://github.com/vtfk/graph-tasks-scripts/assets/46957821/01548758-4461-40af-b9e7-25872879779d)

- Result is found in result folder within [Script directory](/scripts/ansattoversikt-til-nettside)

# How to create a new script
- Inside the scripts folder, create a new folder with the name of the script. 
- Then inside the new folder create config.js file if needed and an index.js file.
- Then create a new NPM script in the package.json file with the name of the script like this: "name-of-the-script": "node \"scripts/name-of-the-script/index.js\""
- All the scripts can be found in "NPM SCRIPTS" in vscode like seen in the pictures above. 
