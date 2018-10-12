describe('Logsene log ', function () {
  this.timeout(50000)
  it('log N entries and get N events', function (done) {
    try {
      var winston = require('winston')
      var Logsene = require('../lib/index.js')
      var transport = new Logsene({token: process.env.LOGSENE_TOKEN})
      var logger = winston.createLogger({
        transports:[transport]
      })
      var counter = 0
      for (var i = 0; i < 100; i++) {
        logger.info('Test %d for %s', i, 'logsene', {x: i, y: {arr: [1, 2, 3, 4]}})
      }
      transport.on('logged', function (data) {
        counter++
        if (counter == 99) {
          done()
        }
      })
      transport.on('finish', function (err) {
        if (err) {
          done(err)
        }
      })
      logger.end()
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
      var transport = new Logsene({token: process.env.LOGSENE_TOKEN, setSource: true, source: 'mocha-test'})
      var logger = winston.createLogger({
        transports:[transport]
      })
      transport.on('logged', function(data) {
        if (data.source === 'mocha-test') {
          done()
        }
      })
      logger.info('Test')
      logger.on('finish', function (err, level, message, data) {
        if (err) {
          done(err)
        }
      })
      logger.end()
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
      var transport = new Logsene({
        token: process.env.LOGSENE_TOKEN,
        setSource: false,
        flushOnExit: true,
        rewriter: function (level, msg, meta) {
          meta.ip = serverIp
          return meta
        }
      })
      var logger = winston.createLogger({
        transports:[transport]
      })
      var serverIp = '10.0.0.12'
      var lo = {x: 1}
      transport.on('logged', function(data) {
        if (data.ip === serverIp) {
          done()
        } else {
          done(new Error('rewrite field ip is not correct:' + data.ip))
        }
      })
      logger.info('Test', lo)
      logger.end()
    } catch (ex) {
      console.log(ex.stack)
      done(ex)
    }
  })
})
