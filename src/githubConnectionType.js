const exec = require('child_process').exec

module.exports = function checkIfGithubSSHExists(callback) {
  try {
    exec('ssh -T git@github.com', function(error, stdout, stderr) {
      if (error.message.match(/successfully authenticated/)) {
        return callback(true)
      }
      return callback(false)
    })
  } catch (err) {
    return callback(false)
  }
}