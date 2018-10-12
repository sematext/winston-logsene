![](https://travis-ci.org/sematext/winston-logsene.svg?branch=master)


This is a transport module for the winston logger [winstonjs/winston](https://github.com/winstonjs/winston) for logging with [Logsene](http://www.sematext.com/logsene) by Sematext.

Winston-Logsene combines the flexibility of using the Winston logging framework with Logsene (think Hosted Elasticsearch + Kibana).
Create your free account and access token [here](https://apps.sematext.com/users-web/register.do).

## Usage

```js

var winston = require('winston')
var Logsene = require('winston-logsene')
var logger = winston.createLogger({
  transports: [new Logsene({
    token: process.env.LOGSENE_TOKEN,
    type: 'test_logs',
    url: 'https://logsene-receiver.sematext.com/_bulk'
  })]
})
```
### Options

- __token__ - Create your free account and access token [here](https://apps.sematext.com/users-web/register.do).
- __type__ - Type of your logs - please note you can define [Elasticsearch mapping templates in Logsene](http://blog.sematext.com/2015/02/09/elasticsearch-mapping-types-for-json-logging/)
- __url__ - Logsene receiver URL (e.g. for Logsene On Premises), defaults to Sematext Cloud (US) receiver `https://logsene-receiver.sematext.com/_bulk`.  To ship logs to Sematext Cloud (EU) in Europe use `https://logsene-receiver.eu.sematext.com/_bulk`
- __handleExceptions__ - boolean 'true' logs 'uncaught exceptions'
- __exitOnError__ - if set to 'false' process will not exit after logging the 'uncaught exceptions'
- __source__ - name of the logging source, by default name of the main node.js module
- __setSource__ - "true" adds "source" to the log event (modifies the object!), default false
- __rewriter__ - similar to rewriters in winston, rewriter allows modifying of __log meta__ but only for the logsene
  transport. This is a simple function which takes `level, msg, meta` as parameter and returns the new __meta__ array
- __flushOnExit__ - Handling SIGTERM, SIGQUIT, SIGINT and 'beforeExit' to flush logs and terminate. Default value: true.


### Examples

```js
// use dynamic list of placeholders and parameters and any Object as Metadata
// message placeholders work the same way as in util.format()
logger.info ('Info Message')
// utilize tags (in the metadata object) as filter to be used in Logsene UI
logger.info ('Info Message', {tags: ['info', 'test']})
logger.info ("Info message no. %d logged to %s",1,'Logsene', {metadata: "test-log", count:1 , tags: ['test', 'info', 'winston']})
logger.error ("Error message no. %d logged to %s",1,'Logsene', {metadata: "test-error", count:1, tags: ['test', 'error', 'winston']})
logger.warn ("Warning message no. %d logged to %s",1,'Logsene', {metadata: "test-warning", count:1, tags: ['test', 'warning', 'winston']})
logger.debug ("Debug message no. %d logged to %s",1,'Logsene', {metadata: "test-debug", count:1})

// use custom rewriter
var serverIp = "10.0.0.12";
var logger = winston.createLogger({
  transports: [new Logsene({
    token: process.env.LOGSENE_TOKEN,
    rewriter: function (level, msg, meta) {
      meta.ip = serverIp;
      return meta;
    }
  })]
})
```

### Schema / Mapping definition for Meta-Data

It is possible to log any JSON Object as meta data, but please note Logsene stores data in Elasticsearch and therefore you should define an index template, matching your data structure.
More about Elasticsearch mapping and templates for Logsene:
[http://blog.sematext.com/2015/01/20/custom-elasticsearch-index-templates-in-logsene/](http://blog.sematext.com/2015/01/20/custom-elasticsearch-index-templates-in-logsene/)

In addition you should use different types for different meta data structures to avoid type conflicts in Elasticsearch. Include a type name in the meta-data like {type: 'logType1', ...} - this overwrites the "type" property, specified in the contstructor.
```
logger.add (logsene, {token: process.env.LOGSENE_TOKEN, type: 'my_logs'})
// numeric id, log type from constructor
logger.info('hello', {id: 1})
// The next line will cause a type conflict in Elasticsearch/Logsene, because id was a number before
logger.info('hello', {id: 'ID-1'})
// using a different type, OK no type conflict for the field 'id' in Elasticsearch/Logsene
// because we use a different type in the Elasticsearch/Logsene index
logger.info('hello', {type: 'my_type_with_string_ids',{id: 'ID-1'})
```

## Security

- HTTPS is enabled by default
- Environment variables for Proxy servers:
  - For HTTPS endpoints (default): HTTPS_PROXY / https_proxy
```
        export HTTPS_PROXY=https://my-ssl-proxy.example
        export HTTPS_PROXY=http://my-proxy.example
```
  - For HTTP endpoints (e.g. On-Premises): HTTP_PROXY / http_proxy
```
        export HTTP_PROXY=http://my-proxy.example
        export HTTP_PROXY=https://my-ssl-proxy.example
```

## License

Apache 2, see LICENSE file


