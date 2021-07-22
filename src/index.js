const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const sha1 = require('sha1-regex')
const isGithubUrl = require('is-github-url')
const parseGithubUrl = require('parse-github-url')

const fileExists = require('./fileExists')
const cloneRepo = require('./cloneRepo')
const updateRepo = require('./updateRepo')
const checkoutCommitHash = require('./checkoutCommit')
const checkIfGithubSSHExists = require('./githubConnectionType')

const insideNodeModulesFolder = cwd.indexOf('node_modules') > -1
const cwd = process.cwd()

// TODO make api nicer?
function installGithubDeps(repos) {
  // make api accept arrays?
  if (typeof repos === 'string') {
    doIt(repos, pathName)
  }
}

async function installGithubDependancy(repoUrl, pathName, cb) {
  let callback = cb || noOp
  if (typeof pathName === 'function') {
    callback = pathName
    pathName = null
  }
  const isSSH = await checkIfGithubSSHExists()
  const prefix = (isSSH) ? 'git@github.com:' : 'https://github.com/'
  const fallback = (!isSSH) ? 'https://github.com/' : 'git@github.com:'
  // remove trailing slash
  const sanitizedURL = repoUrl.replace(/\/$/, '')
  if (!isGithubUrl(sanitizedURL.split("#")[0])) {
    throw new Error(`[Install Github Dep Error]: ${repoUrl} is invalid github URL`)
  }
  const githubObject = parseGithubUrl(sanitizedURL)
  const filePath = pathName || path.join(cwd, githubObject.name)

  // remove trailing slash
  const repoPath = githubObject.path.replace(/\/$/, '')
  let branch = githubObject.branch || 'master'
  const isCommitHash = sha1.test(branch)
  let commitHash
  if (isCommitHash) {
    branch = 'master'
  }

  const cloneURL = `${prefix}${repoPath}.git`
  const fallbackURL = `${fallback}${repoPath}.git`

  if (!fileExists(filePath)) {
    // clone it
    await cloneRepo({ 
      repoPath: cloneURL,
      branch, 
      outputDir: filePath,
      fallbackPath: fallbackURL,
      cwd: cwd,
    }).then(() => {
      if (!isCommitHash) {
        return callback()
      }
      // if branch was actually a commit hash, checkout code to correct hash
      checkoutCommitHash(filePath, githubObject.branch, () => {
        return callback()
      })
    })
  }
  if (fileExists(path.join(filePath, '.git'))) {
    console.log('git repo already exists')
    if (isCommitHash) {
      await updateRepo(filePath, githubObject.branch).then(() => {
        return callback()
      })
    } else {
      await updateRepo(filePath, branch).then(() => {
        return callback()
      })
    }
  }
}

function noOp() {}

module.exports = installGithubDependancy


/* usage
installGithubDependancy('https://github.com/davidwells/markdown-magic', () => {
  console.log('hi')
})
/**/