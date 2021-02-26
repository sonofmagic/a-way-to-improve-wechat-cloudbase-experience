// 云函数入口文件
const cloud = require('~/common/cloud')

const userCol = require('~/common/db/collection/user')

const { UserInfoProjection } = require('~/common/model/index.js')
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { baseInfo } = event

  const { data } = await userCol
    .where({
      openid: wxContext.OPENID
    })
    .field(UserInfoProjection)
    .get()
  if (data.length > 0) {
    return data[0]
  } else {
    if (baseInfo && typeof baseInfo === 'object') {
      const insertData = {
        ...baseInfo,
        openid: wxContext.OPENID,
        cards: []
      }
      await userCol.add({
        data: insertData
      })
      return insertData
    } else {
      return null
    }
  }
}
