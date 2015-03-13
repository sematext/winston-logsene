describe('Logsene log ', function () {
  this.timeout(50000)
  it('should pass', function (done) {

    try {
      var winston = require('winston')
      var Logsene = require('../lib/index.js')
      var logger = new winston.Logger()
      logger.add (Logsene, {token: process.env.LOGSENE_TOKEN})
      var counter = 0
      for (var i = 0; i < 100; i++) {
        logger.info("Test %d for %s", i,'logsene', {x: i}, function (err, res) {
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
      done(err)
    }
  })
})

