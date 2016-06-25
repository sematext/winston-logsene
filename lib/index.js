var util = require('util')
var winston = require('winston')
var Transport = winston.Transport
var common = require('winston/lib/winston/common')
var _dirname = require('path').dirname
var LogseneJS = require('logsene-js')
var flat = require('flat')
var Logsene = function (options) {
  Transport.call(this, options)
  options = options || {}
  this.logsene_debug=options.logsene_debug
  this.handleExceptions = options.handleExceptions
  this.exitOnError = options.exitOnError
  this.errorOutput = []
  this.writeOutput = []
  this.flatOptions = options.flatOptions || {safe: true, delimiter: '_'}
  this.json = options.json || false
  this.colorize = options.colorize || false
  this.prettyPrint = options.prettyPrint || false
  this.timestamp = typeof options.timestamp !== 'undefined' ? options.timestamp : false
  this.label = options.label || null
  this.source = options.source || (process.mainModule ? null : _dirname(process.mainModule.filename)) || module.filename
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
  this.logger.on('error', function (err) {
    self.emit('error', err)
  })
  this.logger.on('log', function (data) {
    self.emit('logged', data)
    self.emit('flush', data)
  })
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
  var metaData = meta
  if (this.silent) {
    return callback(null, true)
  }
  if (meta && (!meta['source'])) {
    meta.source = this.source
  }
  if (this.rewriter){
    meta = this.rewriter(level, msg, meta)
  }
  if (meta instanceof Error) {
    if (!msg) {
        msg = meta.stack || meta.message 
    } 
    metaData = {error_stack: meta.stack || meta.message}  
  }
  var output = common.log({
    colorize: this.colorize,
    json: this.json,
    level: level,
    message: msg,
    meta: metaData,
    stringify: this.stringify,
    timestamp: new Date(), //this.timestamp,
    prettyPrint: this.prettyPrint,
    raw: this.raw,
    label: this.label
  })
  if (this.logsene_debug) {
    console.log(output)  
  }
  this.logger.log(level, msg, flat(metaData, this.flatOptions), callback)
  if (level === 'error' || level === 'debug') {
    this.errorOutput.push(output)
  } else {
    this.writeOutput.push(output)
  }
}

Logsene.prototype.clearLogs = function () {
  // not required ?
}

module.exports = Logsene
module.exports.Logsene = Logsene
