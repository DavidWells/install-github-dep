# Install Github Deps

Install github repos as dependancies within projects

This allows you to work directly on a given repos source code while using it in a given project

Use in postinstall hook

```js
const installGithubDependancy = require('install-github-dep')

/* usage */
installGithubDependancy('https://github.com/davidwells/markdown-magic', () => {
  console.log('hi')
})
```
