const path = require('path')
const exec = require('child_process').exec
const cwd = process.cwd()

module.exports = function checkoutCommitHash(filePath, hash, callback) {
  const command = `cd ${filePath} && git checkout ${hash}`
  const child = exec(command, { cwd: filePath }, (error, stdout, stderr) => {
    if (error) console.warn(error)
  })
  child.on('close', (code) => {
    const name = path.basename(filePath)
    console.log(`${name} has been updated to commit #${hash}`)
    if (callback) {
      callback()
    }
  })
}