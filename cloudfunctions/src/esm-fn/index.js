
import cloud from '~/common/cloud'
import { getNowFullDate } from '~/common/util/day'
import { getNanoid } from '~/common/util/nanoid'
export async function main (event, context) {
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
