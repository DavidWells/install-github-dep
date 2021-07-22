const path = require('path')
const { exec } = require('child_process')

module.exports = function checkoutCommitHash(filePath, hash) {
  return new Promise((resolve, reject) => {
    const command = `cd ${filePath} && git checkout ${hash}`
    const child = exec(command, { cwd: filePath }, (error, stdout, stderr) => {
      if (error) console.warn(error)
    })
    child.on('close', (code) => {
      const name = path.basename(filePath)
      const msg = `${name} has been updated to commit #${hash}`
      console.log(msg)
      resolve(msg)
    })
  })
}