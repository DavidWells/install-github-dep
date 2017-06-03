const exec = require('child_process').exec
const cwd = process.cwd()

module.exports = function cloneRepo(repo, branch, path, callback) {
  console.log(`Cloning repo down ${branch} branch of ${repo} to ${path}`)
  const finalPath = (path) ? ` ${path}` : ''

  const command = `git clone -b ${branch} ${repo}${finalPath}`
  const child = exec(command, { cwd }, (error, stdout, stderr) => {
    if (error) {
      console.warn(error)
    }
  })
  child.stdout.on('data', (data) => {
    console.log(data)
  })
  child.stderr.on('data', (data) => {
    console.log(data)
  })
  child.on('close', (code) => {
    console.log(`${repo} successfully cloned`)
    if (callback) {
      callback()
    }
  })
}