var util = require('util')
var winston = require('winston')
var Transport = winston.Transport
var common = require('winston/lib/winston/common')
var _dirname = require('path').dirname
var LogseneJS = require('logsene-js')

var Logsene = function (options) {
  Transport.call(this, options)
  options = options || {}

  this.errorOutput = []
  this.writeOutput = []

  this.json = options.json || false
  this.colorize = options.colorize || false
  this.prettyPrint = options.prettyPrint || false
  this.timestamp = typeof options.timestamp !== 'undefined' ? options.timestamp : false
  this.label = options.label || null
  this.source = options.source || _dirname(process.mainModule.filename) || module.filename

  if (this.json) {
    this.stringify = options.stringify || function (obj) {
      return JSON.stringify(obj, null, 2)
    }
  }
  this.logger = new LogseneJS(options.token)
}

//
// Inherit from `winston.Transport`.
//
util.inherits(Logsene, winston.Transport)

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
Logsene.prototype.log = function (level, msg, meta, callback) {
  if (this.silent) {
    return callback(null, true)
  }
  var self = this
  var output = common.log({
    colorize: this.colorize,
    json: this.json,
    level: level,
    message: msg,
    meta: meta,
    stringify: this.stringify,
    timestamp: this.timestamp,
    prettyPrint: this.prettyPrint,
    raw: this.raw,
    label: this.label
  })
  meta['@source'] = this.source
  this.logger.log(level, msg, meta, callback)
  if (level === 'error' || level === 'debug') {
    this.errorOutput.push(output)
  } else {
    this.writeOutput.push(output)
  }
  self.emit('logged')
}

Logsene.prototype.clearLogs = function () {
  // not required ?
}

module.exports = Logsene
