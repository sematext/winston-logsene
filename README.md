This is an a transport module for the winston logger [flatiron/winston](https://github.com/flatiron/winston) logging into [Logsene](http://www.sematext.com/logsene) by Sematext.

Logsene provides an Elasticsearch Cluster, the Logsene User-Interface, Access Security, CSV Export, account and app sharing, alerts and more.
The log transport is using HTTPS/TLS by default.

Winston-Logsene combines the flexibility of using the Winston logging framework with Logsene.
Create your access token [here](https://apps.sematext.com/users-web/register.do) - the free account includes 1 million log messages.

## Usage

```

        var winston = require('winston')
        var LogseneTransport = require('winston-logsene')
        var logger = new (winston.Logger)({
            transports: [
              new (winston.transports.Console)(),
              new (LogseneTransport.Logsene)({token: process.env.LOGSENE_TOKEN})
            ]
        })
        // use dynamic list of placeholders and parameters and any Object as Metadata
        // message placeholders work the same way as in util.format()
        logger.info ('Info Message')
        logger.info ()'Info Message', {tags: ['info', 'test']})
        logger.info ("Info message no. %d logged to %s",1,'Logsene', {metadata: "test-log", count:1 , tags: ['test', 'info', 'winston']})
        logger.error ("Error message no. %d logged to %s",1,'Logsene', {metadata: "test-error", count:1, tags: ['test', 'info', 'winston']})
        logger.warning ("Warning message no. %d logged to %s",1,'Logsene', {metadata: "test-warning", count:1, tags: ['test', 'info', 'winston']})
        logger.debug ("Debug message no. %d logged to %s",1,'Logsene', {metadata: "test-debug", count:1})

```


## License

Apache 2, see LICENCE file


