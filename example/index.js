// this example needs a Sematext Logs Token
// please set LOGS_TOKEN=YOUR_LOGS_TOKEN environment variable

// var Logsene = require('winston-logsene')
// for local tests, we import winston-logsene from the parent folder
var Logsene = require('../lib/index.js')

var winston = require('winston')
const {createLogger, format} = require('winston')

// example for custom rewriter, e.g. add myServerIp field to all logs
var myServerIp = '10.0.0.12'

var logger = createLogger({
  levels: winston.config.npm.levels,
  // format: winston.format.json(),
  transports: [new Logsene({
    // set log level, defaut is 'info'
    level: 'silly',
    // optional set a format function
    format: format.splat(),
    token: process.env.LOGS_TOKEN,
    // you can adjust log message in the rewrite function
    rewriter: function (level, msg, meta) {
      meta.ip = myServerIp
      return meta
    }
  })]
})

logger.on('flush', function () { console.log('logs flushed', arguments) })
logger.on('error', console.error)
// logger.on('logged', console.log)

// Setup HTTP service to demonstrate logging
var http = require('http')
const PORT = 7080

function handleRequest (request, response) {
  logger.silly('request for: ' + request.url, request.headers)
  response.end('It Works!! Path Hit: ' + request.url)
  // log memory usage for simple monitoring
  logger.silly('memory usage' + process.memoryUsage().rss, process.memoryUsage())
}
var server = http.createServer(handleRequest)
// graceful shutdown
process.on('SIGINT', function () {
  // avoid handling HTTP requests in shutdown phase
  server.close(function () {
    logger.info('Closed HTTP server socket')
    console.log('Closing HTTP server socket')
  })
  // make sure web server process terminates in 15 seconds
  // this should give winston-logsene time to flush log buffer
  setTimeout(process.exit, 15000)
})

server.listen(PORT, function () {
    // Callback triggered when server is successfully listening. Hurray!
  console.log('Server listening on: http://localhost:%s', PORT)
})
