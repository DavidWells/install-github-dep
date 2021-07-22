const { exec } = require('child_process')

module.exports = async function cloneRepo({ 
  repoPath,
  branch, 
  outputDir,
  fallbackPath,
  cwd,
}) {
  console.log(`Cloning repo down ${branch} branch of ${repoPath} to ${outputDir}`)
  let resp
  try {
    resp = await clone(repoPath, branch, outputDir, cwd)
  } catch(e) {
    resp = await clone(fallbackPath, branch, outputDir, cwd)
  }
  return resp
}

function clone(repo, branch, path, cwd) {
  return new Promise((resolve, reject) => {
    const finalPath = (path) ? ` ${path}` : ''
    const command = `git clone -b ${branch} ${repo}${finalPath}`
    const child = exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
        return reject(error)
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
      resolve()
    })
  })
}