const fs = require('fs')
const cwd = process.cwd()
const path = require('path');
const chalk = require('chalk')
const fileExists = require('./fileExists')
const cloneRepo = require('./cloneRepo')
const updateRepo = require('./updateRepo')
const checkoutCommitHash = require('./checkoutCommit')
const parseGithubUrl = require('parse-github-url');
const isGithubUrl = require('is-github-url');
const sha1 = require('sha1-regex')
const checkIfGithubSSHExists = require('./githubConnectionType')
const insideNodeModulesFolder = cwd.indexOf('node_modules') > -1


function installGithubDeps(repos) {
  if (typeof repos === 'string') {
    doIt(repos, pathName)
  }
}

function noOp() {}

function installGithubDependancy(repoUrl, pathName, cb) {
  let callback = cb || noOp
  if (typeof pathName === 'function') {
    callback = pathName
    pathName = null
  }
  checkIfGithubSSHExists((isSSH) => {
    const prefix = (isSSH) ? 'git@github.com:' : 'https://github.com/'
    // remove trailing slash
    const sanitizedURL = repoUrl.replace(/\/$/, '')
    if(!isGithubUrl(sanitizedURL.split("#")[0])) {
      console.log(chalk.red(`${repoUrl} is invalid github URL`))
      return false
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

    if (!fileExists(filePath)) {
      // clone it
      cloneRepo(cloneURL, branch, filePath, () => {
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
        updateRepo(filePath, githubObject.branch, () => {
          return callback()
        })
      } else {
        updateRepo(filePath, branch, () => {
          return callback()
        })
      }
    }
  })
}

module.exports = installGithubDependancy

/* usage
installGithubDependancy('https://github.com/davidwells/markdown-magic', () => {
  console.log('hi')
})
/**/