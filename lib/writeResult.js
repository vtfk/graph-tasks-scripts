const { writeFileSync, mkdirSync, existsSync } = require('fs')
const path = require('path')

module.exports = (scriptDir, filenameWithExt, data) => {
  let resultPath = `${scriptDir}/result`
  resultPath = `${path.normalize(resultPath)}`

  let filePath = `${scriptDir}/result/${filenameWithExt}`
  filePath = `${path.normalize(filePath)}`

  console.log(scriptDir)
  console.log(path.normalize(scriptDir))
  console.log(path.normalize(resultPath))
  console.log(path.normalize(`${resultPath}/${filenameWithExt}`))
  if (!existsSync(resultPath)) mkdirSync(resultPath)
  writeFileSync(filePath, data)
}
