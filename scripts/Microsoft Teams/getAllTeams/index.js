(async () => {
  const { getAllGroups, getTeam } = require('./getAllTeams')
  const { logger } = require('@vtfk/logger')
  const { Parser } = require('@json2csv/plainjs')
  const writeResult = require('../../../lib/writeResult')

  const scriptDir = './scripts/Microsoft Teams/getAllTeams'

  const startTime = new Date()
  const timestamp = startTime.toLocaleDateString('fr-CA')

  // Definer groups options her
  const groupOptions = {
    filter: "$filter=resourceProvisioningOptions/Any(x:x eq 'Team')",
    select: "$select=id,resourceProvisioningOptions,displayName,createdDateTime,description,deletedDateTime,mail,renewedDateTime,securityEnabled,visibility",
    expand: "$expand=owners($select=displayName,mail)"
  }

  // Definer teams options her
  const teamOptions = {
    select: "$select=id,resourceProvisioningOptions,displayName"
  }


  // Script
  const result = []
  const failed = []
  const index = 0

  try {
    logger('info', 'Trying to get all Groups')
    const groupRes = await getAllGroups(groupOptions)
    writeResult(__dirname, `${timestamp}-groups.json`, JSON.stringify(groupRes, null, 2))
    logger('info', ['Det gikk bra 😁', 'Vi fant antall grupper', groupRes.count])

    // const groupRes = require('./groups.json')
    
    let activeGroups = groupRes.value.filter(group => !group.displayName.startsWith('Exp0822'))
    activeGroups = { count: activeGroups.length, value: activeGroups }
    writeResult(__dirname, `${timestamp}-activegroups.json`, JSON.stringify(activeGroups, null, 2))

    // const activeGroups = require('./activegroups.json')

    const repackedActiveGroups = activeGroups.value.map(group => {
      const owners = group.owners.map(o => o.mail).join(',')
      const resourceProvisioningOptions = group.resourceProvisioningOptions.join(',')
      delete group.owners
      delete group.resourceProvisioningOptions
      return {
        ...group,
        resourceProvisioningOptions,
        owners
      }
    })
    const parser = new Parser()
    const csvActiveGroups = parser.parse(repackedActiveGroups)

    writeResult(__dirname, `${timestamp}-activegroups.csv`, csvActiveGroups)

    const runTime = Math.abs(new Date() - startTime)
    const runMinutes = Math.floor((runTime/1000)/60)

    logger('info', [`Ferdig! Scriptet kjørte i ${runMinutes} minutter 😁`, 'Vi fant antall grupper', groupRes.count, 'Antall aktive grupper', activeGroups.count])

  } catch (error) {
    logger('error', error)
  }

  /*
  logger('info', 'Trying to get all Teams')

  for (const group of groupRes.value) {
    logger('info', `Trying to get team ${index} of ${groupRes.count}. Current groupname: ${group.displayName}`)
    try {
      const team = await getTeam(group.id, teamOptions) // Husk å fikse options
      result.push(team.value)
    } catch (error) {
      group.error = error
      failed.push(group)
      logger('error', `Failed on team ${index} of ${groupRes.count}. Groupname: ${group.displayName}`)
    }
  }

  // Skriv result til fil
  writeFileSync('./scripts/Microsoft Teams/getAllTeams/teams.json', JSON.stringify(result, null, 2))

  // Skriv error rapport til fil
  writeFileSync('./scripts/Microsoft Teams/getAllTeams/failedGroups.json', JSON.stringify(failed, null, 2))
  */
})()