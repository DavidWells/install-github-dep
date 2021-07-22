# Install Github Deps

Install github repos as dependencies within projects

This allows you to work directly on a given repos source code while using it in a given project.

Use in postinstall hook

```js
const installGithubDep = require('install-github-dep')

/* usage */
installGithubDep('https://github.com/davidwells/markdown-magic', () => {
  console.log('working git repo installed to ./markdown-magic')
})
```
