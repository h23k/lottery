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

app.get('/:type/latest', (req, res) => {
  const paramType = req.params.type === '6' ? 'loto6' : 'loto7'
  const sql = `select times, num, bonus
                 from ${paramType}
                where times = (select max(times) from ${paramType})
                order by bonus, num`
  const connection = mysql.createConnection(connectionConfig)
  connection.connect()
  connection.query(sql, [], (error, results, fields) => {
    if (error) throw error
    let times = 0
    const nums = []
    const bonus = []
    results.forEach((result) => {
      times = times < result.times ? result.times : times
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
    res.json({ times, nums, bonus })
  })
  connection.end()
})

app.get('/:type/count', (req, res) => {
  const paramType = req.params.type === '6' ? 'loto6' : 'loto7'
  const sql = `select total.num, total.count, total.last, lucky.count, lucky.last, lucky_recent.count, bonus.count, bonus.last
                 from (select num, count(num) as count, max(times) as last
                              from ${paramType}
                             group by num) as total
                 left join (select num, count(num) as count, max(times) as last
                              from ${paramType}
                             where bonus = 0
                             group by num) as lucky
                   on total.num = lucky.num
                 left join (select num, count(num) as count, max(times) as last
                              from ${paramType}
                             where bonus = 0
                               and times >= (select max(times) - 52 from ${paramType})
                             group by num) as lucky_recent
                   on total.num = lucky_recent.num
                 left join (select num, count(num) as count, max(times) as last
                              from ${paramType}
                             where bonus = 1
                             group by num) as bonus
                   on total.num = bonus.num
                order by lucky.last desc, lucky_recent.count desc, total.num`
  const connection = mysql.createConnection(connectionConfig)
  connection.connect()
  connection.query({ sql, nestTables: true }, [], (error, results, fields) => {
    if (error) throw error
    const nums = results.map((result) => {
      return {
        number: result.total.num,
        totalCount: result.total.count,
        totalLast: result.total.last,
        luckyCount: result.lucky.count,
        luckyLast: result.lucky.last,
        luckyRecentCount: result.lucky_recent.count,
        bonusCount: result.bonus.count,
        bonusLast: result.bonus.last,
      }
    })
    res.json({ nums })
  })
  connection.end()
})

app.get('/:type/:times', (req, res) => {
  const paramType = req.params.type === '6' ? 'loto6' : 'loto7'
  const paramTimes = req.params.times
  const sql = `select a.num, a.bonus, b.last
                 from (select times, num, bonus
                              from ${paramType}
                             where times = ?) as a
                 left join (select num, max(times) as last, bonus
                              from ${paramType}
                             where times < ?
                             group by num, bonus) as b
                   on a.num = b.num
                  and a.bonus = b.bonus
                order by a.bonus, a.num`
  const connection = mysql.createConnection(connectionConfig)
  connection.connect()
  connection.query(
    { sql, nestTables: true },
    [paramTimes, paramTimes],
    (error, results, fields) => {
      if (error) throw error
      const nums = results.map((result) => {
        return {
          number: result.a.num,
          bonus: result.a.bonus,
          last: result.b.last,
        }
      })
      res.json({ times: paramTimes, nums })
    }
  )
  connection.end()
})

module.exports = app
