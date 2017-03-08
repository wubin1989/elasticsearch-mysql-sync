const CronJob = require('cron').CronJob

class SyncJob extends CronJob {
  constructor (opts) {
    let options = opts || {
      cronTime: '00 00 00 * * *',
      start: false,
      timeZone: 'Asia/shanghai'
    }
    super(options)
  }

  fireOnTick () {}

  start () {
    super.start()
  }
}

module.exports = SyncJob
