const path = require('path')
const exec = require('child_process').exec
const cwd = process.cwd()

module.exports = function updateRepo(filePath, branch, callback) {
  const name = path.basename(filePath)
  const command = `git pull origin ${branch}`
  const child = exec(command, { cwd: filePath }, (error, stdout, stderr) => {
    if (error) {
      console.warn(error)
    }
    // console.log(stdout)
  })
  child.stdout.on('data', (data) => {
    console.log(`${name} repo updated`)
  })
  child.stderr.on('data', (data) => {
    // console.log(data)
  })
  child.on('close', (code) => {
    if(callback) {
      callback()
    }
  })
}