describe('Logsene log ', function () {
  this.timeout(50000)
  it('log N entries and get N events', function (done) {
    try {
      var winston = require('winston')
      var Logsene = require('../lib/index.js')
      var logger = new winston.Logger()
      logger.add(Logsene, {token: process.env.LOGSENE_TOKEN})
      var counter = 0
      for (var i = 0; i < 100; i++) {
        logger.info('Test %d for %s', i, 'logsene', {x: i, y: {arr: [1, 2, 3, 4]}}, function (err, res) {
          counter++
          if (counter == 99) {
            done()
          }
          if (err) {
            done(err)
          }
        })
      }
    } catch (ex) {
      console.log(ex.stack)
      done(ex)
    }
  })
})
describe('Logsene log source', function () {
  it('should have source mocha-test', function (done) {
    try {
      var winston = require('winston')
      var Logsene = require('../lib/index.js')
      var logger = new winston.Logger()
      logger.add(Logsene, {token: process.env.LOGSENE_TOKEN, source: 'mocha-test'})
      logger.info('Test', function (err, level, message, data) {
        if (err) {
          done(err)
        }
        if (data.source === 'mocha-test') {
          done()
        } else {
          done(new Error('source not correct:' + data.source))
        }
      })
    } catch (ex) {
      console.log(ex.stack)
      done(ex)
    }
  })
})
describe('Logsene rewrite hook', function () {
  it('should have correct meta.ip field', function (done) {
    try {
      var winston = require('winston')
      var Logsene = require('../lib/index.js')
      var logger = new winston.Logger()
      var serverIp = '10.0.0.12'
      logger.add(Logsene, {
        token: process.env.LOGSENE_TOKEN,
        rewriter: function (level, msg, meta) {
          meta.ip = serverIp
          return meta
        }
      })
      logger.info('Test', function (err, level, message, meta) {
        if (meta.ip === serverIp) {
          done()
        } else {
          done(new Error('rewrite field ip is not correct:' + meta.ip))
        }
      })
    } catch (ex) {
      console.log(ex.stack)
      done(ex)
    }
  })
})
