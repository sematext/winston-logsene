This is a transport module for the winston logger [winstonjs/winston](https://github.com/winstonjs/winston) for logging with [Logsene](http://www.sematext.com/logsene) by Sematext.

Winston-Logsene combines the flexibility of using the Winston logging framework with Logsene (think Hosted Elasticsearch + Kibana).
Create your free account and access token [here](https://apps.sematext.com/users-web/register.do).

## Usage

```js

        var winston = require('winston')
        var logsene = require('winston-logsene') 
        var logger = new winston.Logger()
        logger.add (logsene, {token: process.env.LOGSENE_TOKEN, type: 'test_logs'})
 ```
### Options

- __token__ - Create your free account and access token [here](https://apps.sematext.com/users-web/register.do).
- __type__ - Type of your logs - please note you can define [Elasticsearch mapping templates in Logsene](http://blog.sematext.com/2015/02/09/elasticsearch-mapping-types-for-json-logging/) 


### Examples

```
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

## Security

- HTTPS is enabled by default 
- Environment variables for Proxy servers:
  - HTTPS_PROXY / https_proxy
    ```
        export HTTPS_PROXY=https://my-ssl-proxy.example
    ```
          
## License

Apache 2, see LICENSE file


