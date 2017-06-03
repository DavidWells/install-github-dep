const fs = require('fs')

module.exports = function fileExists(filePath) {
  try {
    fs.statSync(filePath)
    return true
  } catch (err) {
    return false
  }
}