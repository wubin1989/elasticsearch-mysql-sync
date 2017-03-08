"use strict"

const elasticsearch = require("elasticsearch")
const mysql = require("mysql")
const cronJob = require('./cronjob')
const SyncJob = cronJob.SyncJob
const EsUtil = require("es_utils")
const _ = require("lodash")

class Syncer extends EsUtil {
  constructor(config) {
    super(config.elasticsearch, config.index, config.type)
    this.sql = config.sql
    this.connection = mysql.createConnection(config.mysql)
    this.settings = config.settings
    this.mappings = config.mappings
    this.schedule = config.schedule
    this.$lastexecutionstart = config.initialParameter.lastexecutionstart || new Date()
    this.$lastexecutionend = config.initialParameter.lastexecutionend || new Date()
    this.$totalrows = config.initialParameter.totalrows || 0
  }

  async sync() {
    try {
      const body = {
        settings: this.settings,
        mappings: this.mappings
      }
      try {
        await this.createIndex(body)
      } catch (error) {}

      let results
      for (let i = 0; i < this.sql.length; i++) {
        const statement = this.sql[i].statement
        const parameter = this.sql[i].parameter
        results = await new Promise((resolve, reject) => {
          const that = this
          this.connection.query(statement, parameter,
            function(error, results, fields) {
              if (error) reject(error)
              resolve(results)
            })
        })
        console.log(results);
      }
      const docs = results.map(x => {
        const _x = _.cloneDeep(x)
        _x._id = undefined
        return {
          id: x._id,
          doc: _x
        }
      })

      const resp = await this.bulkIndex(docs)
      console.log(JSON.stringify(resp, null, 4))

    } catch (error) {
      console.log(error)
    }
  }

  async incrementSync() {
    try {

      const syncJob = new SyncJob(this.schedule)

      syncJob.fireOnTick = async() => {
        try {
          this.$lastexecutionstart = new Date()
          const body = {
            settings: this.settings,
            mappings: this.mappings
          }
          try {
            await this.createIndex(body)
          } catch (error) {}

          let results
          for (let i = 0; i < this.sql.length; i++) {
            const statement = this.sql[i].statement
            const parameter = this.sql[i].parameter.map(x => {
              if (x[0] === "$") {
                x = this[x]
              }
              return x
            })
            results = await new Promise((resolve, reject) => {
              const that = this
              this.connection.query(statement, parameter,
                function(error, results, fields) {
                  if (error) reject(error)
                  resolve(results)
                })
            })
            console.log(results);
          }

          this.$totalrows += results.length

          const docs = results.map(x => {
            const _x = _.cloneDeep(x)
            _x._id = undefined
            return {
              id: x._id,
              doc: _x
            }
          })

          const resp = await this.bulkIndex(docs)
          console.log(JSON.stringify(resp, null, 4))

          this.$lastexecutionend = new Date()
        } catch (error) {
          console.log(error)
        }
      }

      syncJob.start()

    } catch (error) {
      console.log(error)
    }
  }

}

module.exports = Syncer