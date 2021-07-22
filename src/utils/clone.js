const { exec } = require('child_process')

module.exports = async function cloneRepo({ 
  repoPath,
  branch, 
  outputDir,
  fallbackPath,
  cwd,
}) {
  let resp
  try {
    resp = await clone(repoPath, branch, outputDir, cwd)
  } catch(e) {
    // Fallback to alternative cloning method
    try {
      resp = await clone(fallbackPath, branch, outputDir, cwd)
    } catch(e) {
      console.log(`❌  Github dep install failed for "${repoPath}" & "${fallbackPath}"`)
    }
  }

  if (resp !== 0) {
    throw new Error(`❌ Failed to clone repo. 
"${repoPath}" & "${fallbackPath}" are invalid remote repos or you do not have access to them.
`)
  }

  return resp
}

function clone(repo, branch, path, cwd) {
  return new Promise((resolve, reject) => {
    const finalPath = (path) ? ` ${path}` : ''
    const command = `git clone -b ${branch} ${repo}${finalPath}`
    const child = exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        // console.warn(error)
        return reject(error)
      }
    })
    child.stdout.on('data', (data) => {
      console.log(data)
    })
    child.stderr.on('data', (data) => {
      // console.log(data)
    })
    child.on('close', (code) => {
      if (code == 0) {
        console.log(`✅  Github dep installed "${repo}" -> "${finalPath}"`)
      }
      resolve(code)
    })
  })
}