const { pagedGraphRequest } = require('../../lib/graphRequest')

const getAllGroups = async (options) => {
  if (!options) options = {}
  // Ta inn litt diverse options fra brukeren
  const filter = options.filter ?? ''
  const select = options.select ? `&${options.select}` : ''
  const expand = options.expand ? `&${options.expand}` : ''

  // Hent alle grupper (basert på options - f.eks et filter eller select)
  const queryParams = `${filter}${select}${expand}&$top=999&$count=true`

  const graphOptions = {
    advanced: false,
    onlyFirstPage: false,
  }
  const groups = await pagedGraphRequest(`groups?${queryParams}`, graphOptions)

  return groups
  // Hent alle Teams fra disse gruppene
}

const getTeam = async (teamId, options) => {
  if (!teamId) throw new Error('Missing required parameter "teamId')
  if (!options) options = {}

  const graphOptions = {
    advanced: false,
    onlyFirstPage: false,
  }
  const team = await pagedGraphRequest(`teams/${teamId}?${options.select}`, graphOptions)

  return team
}

module.exports = { getAllGroups, getTeam }