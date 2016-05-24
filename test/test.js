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
