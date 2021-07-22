const { exec } = require('child_process')

module.exports = function checkIfGithubSSHExists() {
  return new Promise((resolve, reject) => {
    try {
      exec('ssh -T git@github.com', function(error, stdout, stderr) {
        if (error.message.match(/successfully authenticated/)) {
          return resolve(true)
        }
        return resolve(false)
      })
    } catch (err) {
      // Unknown assume yes
      return resolve(true)
    }
  })
}