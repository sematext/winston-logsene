'use strict'
var util = require('util')
var Transport = require('winston-transport')
var winston = require('winston')

// var common = require('winston/lib/winston/common')
const winstonCompat = require('winston-compat')
var _dirname = require('path').dirname
var LogseneJS = require('logsene-js')
var flat = require('flat')

var Logsene = function (options) {
  options = options || {}
  if (!options.hasOwnProperty('flushOnExit')) {
    options.flushOnExit = true
  }
  if (!options.levels) {
    options.levels = winston.config.npm.levels
  }
  Transport.call(this, options)
  this.logCount = 0
  this.setSource = options.setLogSource
  if (options.hasOwnProperty('setSource')) {
    this.setSource = options.setSource
  } else {
    this.setSource = false
  }
  this.logsene_debug = options.logsene_debug
  this.flatOptions = options.flatOptions || { safe: true, delimiter: '_' }
  this.json = options.json || false
  this.colorize = options.colorize || false
  this.prettyPrint = options.prettyPrint || false
  this.timestamp = typeof options.timestamp !== 'undefined' ? options.timestamp : false
  this.label = options.label || null
  this.source = options.source || (process.mainModule ? _dirname(process.mainModule.filename) : null) || module.filename

  this.rewriter = options.rewriter || null
  if (this.json) {
    this.stringify = options.stringify || function (obj) {
      return JSON.stringify(obj, null, 2)
    }
  }
  this.logger = new LogseneJS(options.token,
    options.type || 'winston_logsene',
    options.url)
  var self = this
  this.logger.on('error', function (e) {
    const { err } = e

    if (err.code === 'EAI_AGAIN') {
      console.log(new Date().toISOString() + ` winston-logsene: cannot reach the receiver URL: ${err.url}, please check your network connection ...`)
      return
    }

    self.emit('error', e)
  })
  this.logger.on('log', function (data) {
    self.logCount = self.logCount - data.count
    self.emit('logged', data)
    self.emit('flush', data)
  })
  var flushLogs = function (callback) {
    var exitTimeout = 99000
    if (self.logCount < 1) {
      console.log(new Date().toISOString() + ' winston-logsene: flush: no logs in buffer')
      callback(null, exitTimeout)
    } else {
      console.log(new Date().toISOString() + ' winston-logsene: start flushing ' + self.logCount + ' logs before exit ...')
      self.logger.once('log', function (data) {
        console.log(new Date().toISOString() + ' winston-logsene: flush before exit: ' + data.count + ' logs send.')
        callback(null, exitTimeout)
      })
      self.logger.once('error', function (err) {
        console.log(new Date().toISOString() + ' winston-logsene: flush before exit error: ' + err)
        callback(err, exitTimeout)
      })
      process.nextTick(self.logger.send.bind(self.logger))
      // when no error or successful "log" event was received,
      // the process should terminate.
      // upstart waits max 10 seconds before kill -9
      callback(null, exitTimeout)
    }
  }
  var logseneExitHandler = function (code) {
    flushLogs(function (logseneErr, exitTime) {
      setTimeout(process.exit, exitTime)
    })
  }
  if (options.handleExceptions) {
    process.on('uncaughtException', function (err) {
      console.log(new Date().toISOString() + ' winston-logsene: uncaughtException: ' + err + ' ' + err.stack)
      self.logger.log('error', err.stack || err.toString(), err)
      flushLogs(function (flushErr, exitTime) {
        if (options.exitOnError) {
          setTimeout(function () {
            process.exit(-1)
          }, exitTime)
        }
      })
    })
  }

  if (options.handleErrors) {
    process.on('error', function (err) {
      console.log(new Date().toISOString() + ' winston-logsene: unhandledError: ' + err + ' ' + err.stack)
      self.logger.log('error', err.stack || err.toString(), err)
      flushLogs(function (flushErr, exitTime) {
        if (options.exitOnError) {
          setTimeout(function () {
            process.exit(-1)
          }, exitTime)
        }
      })
    })
  }

  process.on('unhandledRejection', function (err) {
    console.log(new Date().toISOString() + ' winston-logsene: unhandledRejection: ' + err + ' ' + err.stack)
    self.logger.log('warning', err.stack || err.toString(), err)
  })

  if (options.flushOnExit) {
    process.once('SIGTERM', logseneExitHandler)
    process.once('SIGINT', logseneExitHandler)
    process.once('SIGQUIT', logseneExitHandler)
    process.once('beforeExit', logseneExitHandler)
    process.once('exit', logseneExitHandler)
  }
  // Add toJSON to Error Class
  if (!('toJSON' in Error.prototype)) {
    Object.defineProperty(Error.prototype, 'toJSON', {
      value: function () {
        var alt = {}
        Object.getOwnPropertyNames(this).forEach(function (key) {
          alt[key] = this[key]
        }, this)
        return alt
      },
      configurable: true,
      writable: true
    })
  }
}

//
// Inherit from `winston.Transport`.
//
util.inherits(Logsene, Transport)

//
// Expose the name of this Transport on the prototype
//
Logsene.prototype.name = 'Logsene'

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
Logsene.prototype.log = function (meta, callback) {
  var level = meta.level
  var msg = meta.message
  this.logCount++
  var metaData = meta
  if (this.silent) {
    return callback(null, true)
  }
  if (this.setSource) {
    if (meta && (!meta.source)) {
      meta.source = this.source
    }
  }

  if (this.rewriter) {
    metaData = this.rewriter(level, msg, meta)
  }
  if (meta instanceof Error) {
    if (!msg) {
      msg = meta.stack || meta.message
    }
    metaData = { error_stack: meta.stack || meta.message }
  }
  if (this.logsene_debug) {
    var output = winstonCompat.log({
      colorize: this.colorize,
      json: this.json,
      level: level,
      message: msg,
      meta: metaData,
      stringify: this.stringify,
      timestamp: new Date(), // this.timestamp,
      prettyPrint: this.prettyPrint,
      raw: this.raw,
      label: this.label
    })
    console.log(output)
  }
  this.logger.log(level, msg, flat(metaData, this.flatOptions), callback)
}

Logsene.prototype.clearLogs = function () {
  // not required ?
  process.nextTick(this.logger.send.bind(this.logger))
}

module.exports = Logsene
module.exports.Logsene = Logsene
