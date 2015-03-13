This is a transport module for the winston logger [flatiron/winston](https://github.com/flatiron/winston) for logging with [Logsene](http://www.sematext.com/logsene) by Sematext.

Winston-Logsene combines the flexibility of using the Winston logging framework with Logsene.
Create your free account and access token [here](https://apps.sematext.com/users-web/register.do).

## Usage

```js

        var winston = require('winston')
        var logsene = require('winston-logsene') 
        var logger = new winston.Logger()
        logger.add (logsene, {token: process.env.LOGSENE_TOKEN})
        // use dynamic list of placeholders and parameters and any Object as Metadata
        // message placeholders work the same way as in util.format()
        logger.info ('Info Message')
        // utilize tags (in the metadata object) as filter to be used in Logsene UI
        logger.info ('Info Message', {tags: ['info', 'test']})
        logger.info ("Info message no. %d logged to %s",1,'Logsene', {metadata: "test-log", count:1 , tags: ['test', 'info', 'winston']})
        logger.error ("Error message no. %d logged to %s",1,'Logsene', {metadata: "test-error", count:1, tags: ['test', 'error', 'winston']})
        logger.warn ("Warning message no. %d logged to %s",1,'Logsene', {metadata: "test-warning", count:1, tags: ['test', 'warning', 'winston']})
        logger.debug ("Debug message no. %d logged to %s",1,'Logsene', {metadata: "test-debug", count:1})

```


## License

Apache 2, see LICENSE file


