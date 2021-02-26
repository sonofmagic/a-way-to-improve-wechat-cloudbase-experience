
const { nanoid } = require('nanoid')

function getNanoid (size) {
  return nanoid(size)
}

module.exports = {
  getNanoid
}
