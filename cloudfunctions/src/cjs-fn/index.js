const cloud = require('~/common/cloud')
const { getNowFullDate } = require('~/common/util/day')
const { getNanoid } = require('~/common/util/nanoid')

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    env: wxContext.ENV,
    fullDate: getNowFullDate(),
    nanoid: getNanoid()
  }
}
