const fs = require('fs')
const path = require('path')
const sha1 = require('sha1-regex')
const isGithubUrl = require('is-github-url')
const parseGithubUrl = require('parse-github-url')

const cloneRepo = require('./utils/clone')
const updateRepo = require('./utils/pull')
const checkoutCommitHash = require('./utils/checkout')
const checkIfGithubSSHExists = require('./utils/hasSSH')
const fileExists = (s) => new Promise(r => fs.access(s, fs.F_OK, e => r(!e)))

const cwd = process.cwd()
const insideNodeModulesFolder = cwd.indexOf('node_modules') > -1

// TODO make api nicer?
function installGithubDeps(repos) {
  // make api accept arrays?
  if (typeof repos === 'string') {
    doIt(repos, pathName)
  }
}

async function installGithubDep(repoUrl, pathName, cb) {
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

  const cloneURL = `${prefix}ccc${repoPath}.git`
  const fallbackURL = `${fallback}${repoPath}.git`
  let isFreshInstall = false
  let data = {}

  const repoExists = await fileExists(filePath)
  if (!repoExists) {
    isFreshInstall = true
    // clone it
    await cloneRepo({ 
      repoPath: cloneURL,
      branch, 
      outputDir: filePath,
      fallbackPath: fallbackURL,
      cwd: cwd,
    })

    data = {
      message: 'repo cloned'
    }

    if (isCommitHash) {
      // if branch was actually a commit hash, checkout code to correct hash
      await checkoutCommitHash(filePath, githubObject.branch)
    }
  }
  const isGitRepo = await fileExists(path.join(filePath, '.git'))
  if (!isFreshInstall && isGitRepo) {
    console.log('git repo already exists')
    const branchInfo = (isCommitHash) ? githubObject.branch : branch
    await updateRepo(filePath, branchInfo)
    data = {
      message: 'repo updated'
    }
  }

  if (callback) callback(data)
  return data
}

function noOp() {}

module.exports = installGithubDep


/* usage
installGithubDep('https://github.com/davidwells/markdown-magic', () => {
  console.log('hi')
})
/**/