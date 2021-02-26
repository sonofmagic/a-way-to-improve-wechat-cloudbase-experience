const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc') // dependent on utc plugin
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Shanghai')

function getNowDate () {
  return dayjs().format('YYYY-MM-DD')
}
function getNowTime () {
  return dayjs().format('HH:mm:ss')
}
function getNowFullDate () {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

function getTimeStamp () {
  return dayjs().valueOf()
}

module.exports = {
  dayjs,
  getNowDate,
  getNowTime,
  getNowFullDate,
  getTimeStamp
}
