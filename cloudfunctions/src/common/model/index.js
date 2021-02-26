/**
 * @param {Array} arr
 */
export function createProjection (arr) {
  return arr.reduce((acc, cur) => {
    acc[cur] = 1
    return acc
  }, {})
}
const { infoFields } = require('./user.js')

export const UserInfoProjection = createProjection(infoFields)
