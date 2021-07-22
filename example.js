const installGithubDep = require('./src')

installGithubDep('https://github.com/davidwells/markdown-magic', (data) => {
  console.log('done', data)
})