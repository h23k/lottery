const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const mysql = require('mysql')
const connectionConfig = {
  host: 'localhost',
  port: '3307',
  database: 'my_test',
  user: 'mysql',
  password: 'mysql',
}

app.get('/:type/latest', (req, res, next) => {
  const paramType = req.params.type === '6' ? 'loto6' : 'loto7'
  const sql = `select times, lottery_date, num, bonus
                 from ??
                where times = (select max(times) from ??)
                order by bonus, num`
  const connection = mysql.createConnection(connectionConfig)
  connection.connect()
  connection.query(sql, [paramType, paramType], (error, results, fields) => {
    if (error) {
      next(error)
    } else {
      const times = results.length > 0 ? results[0].times : 0
      const date = results.length > 0 ? results[0].lottery_date : ''
      const nums = []
      const bonus = []
      results.forEach((result) => {
        const num = result.num
        switch (result.bonus) {
          case 0:
            nums.push(num)
            break
          case 1:
            bonus.push(num)
            break
        }
      })
      res.json({ times, date, nums, bonus })
    }
  })
  connection.end()
})

app.get('/:type/count', (req, res, next) => {
  const paramType = req.params.type === '6' ? 'loto6' : 'loto7'
  const recentTimes = req.params.type === '6' ? 103 : 51
  const sql = `select total.num, total.count, total.last, lucky.count, lucky.last, lucky_recent.count, bonus.count, bonus.last
                 from (select num, count(num) as count, max(times) as last
                              from ??
                             group by num) as total
                 left join (select num, count(num) as count, max(times) as last
                              from ??
                             where bonus = 0
                             group by num) as lucky
                   on total.num = lucky.num
                 left join (select num, count(num) as count, max(times) as last
                              from ??
                             where bonus = 0
                               and times >= (select max(times) - ? from ??)
                             group by num) as lucky_recent
                   on total.num = lucky_recent.num
                 left join (select num, count(num) as count, max(times) as last
                              from ??
                             where bonus = 1
                             group by num) as bonus
                   on total.num = bonus.num
                order by total.num`
  const connection = mysql.createConnection(connectionConfig)
  connection.connect()
  connection.query(
    { sql, nestTables: true },
    [paramType, paramType, paramType, recentTimes, paramType, paramType],
    (error, results, fields) => {
      if (error) {
        next(error)
      } else {
        const resultMaxTimes = results.reduce((prevVal, currVal) => {
          return prevVal.total.last >= currVal.total.last ? prevVal : currVal
        })
        const maxTimes = resultMaxTimes.total.last
        const recentCountMax =
          maxTimes - (recentTimes + 1) <= 0 ? maxTimes : recentTimes + 1
        const nums = results.map((result) => {
          return {
            number: result.total.num,
            recentCountMax,
            timesDiff: maxTimes - result.lucky.last + 1,
            totalCount: result.total.count,
            totalLast: result.total.last,
            luckyCount: result.lucky.count,
            luckyRecentCount: result.lucky_recent.count,
            luckyLast: result.lucky.last,
            bonusCount: result.bonus.count,
            bonusLast: result.bonus.last,
          }
        })
        res.json({ nums })
      }
    }
  )
  connection.end()
})

app.get('/:type/:times', (req, res, next) => {
  const paramType = req.params.type === '6' ? 'loto6' : 'loto7'
  const recentTimes = req.params.type === '6' ? 103 : 51
  const paramTimes = req.params.times
  const sql = `select target.lottery_date, target.num, target.bonus, last.last, recent.count
                 from (select times, lottery_date, num, bonus
                              from ??
                             where times = ?) as target
                 left join (select num, bonus, max(times) as last
                              from ??
                             where times < ?
                             group by num, bonus) as last
                   on target.num = last.num
                  and target.bonus = last.bonus
                 left join (select num, bonus, count(num) as count
                              from ??
                             where times between (select max(times) - ? from ??)
                                             and ?
                             group by num, bonus) as recent
                   on target.num = recent.num
                  and target.bonus = recent.bonus
                order by target.bonus, target.num`
  const connection = mysql.createConnection(connectionConfig)
  connection.connect()
  connection.query(
    { sql, nestTables: true },
    [
      paramType,
      paramTimes,
      paramType,
      paramTimes,
      paramType,
      recentTimes,
      paramType,
      paramTimes,
    ],
    (error, results, fields) => {
      if (error) {
        next(error)
      } else {
        const lotteryDate = results[0].target.lottery_date
        const nums = results.map((result) => {
          return {
            number: result.target.num,
            bonus: result.target.bonus,
            last: result.last.last,
            count: result.recent.count,
          }
        })
        res.json({ times: paramTimes, date: lotteryDate, nums })
      }
    }
  )
  connection.end()
})

app.get('/:type/interval/:number', (req, res, next) => {
  const paramType = req.params.type === '6' ? 'loto6' : 'loto7'
  const recentTimes = req.params.type === '6' ? 103 : 51
  const paramNumber = req.params.number
  const sql = `select num, times
                 from ??
                where bonus = 0
                  and num = ?
                  and times >= (select max(times) - ? from ??)
                order by times desc`
  const connection = mysql.createConnection(connectionConfig)
  connection.connect()
  connection.query(
    sql,
    [paramType, paramNumber, recentTimes, paramType],
    (error, results, fields) => {
      if (error) {
        next(error)
      } else {
        const times = []
        results.forEach((result) => times.push(result.times))
        res.json({ num: paramNumber, times })
      }
    }
  )
  connection.end()
})

app.get('/:type/combination/:number', (req, res, next) => {
  const paramType = req.params.type === '6' ? 'loto6' : 'loto7'
  const recentTimes = req.params.type === '6' ? 103 : 51
  const paramNumber = req.params.number
  const sql = `select num, count(num) as count
                 from ??
                where bonus = 0
                  and times in (select times from ??
                                 where bonus = 0
                                   and num = ?
                                   and times >= (select max(times) - ? from ??))
                group by num
                order by count desc`
  const connection = mysql.createConnection(connectionConfig)
  connection.connect()
  connection.query(
    sql,
    [paramType, paramType, paramNumber, recentTimes, paramType],
    (error, results, fields) => {
      if (error) {
        next(error)
      } else {
        const combination = {}
        results.forEach(
          (result) => (combination[`${result.num}`] = result.count)
        )
        res.json({ num: paramNumber, combination })
      }
    }
  )
  connection.end()
})

module.exports = app
