var https = require('https');
var httpProxy = require('http-proxy');
var fs = require('fs');
var apiProxy = httpProxy.createProxyServer();
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8'));
const logging = config.options.logging;
const domains = config.domains;

apiProxy.on('error', function (err, req, res) {
    if (logging) {
        console.log(err);
    }
    res.writeHead(500);
    res.end();
});

function proxyHandler(req, res) {
    try {
        const host = req.headers.host;
        if (!host) {
            if (logging) {
                console.log('{"ip": "' + req.connection.remoteAddress + '","address": "unknown" }');
            }
            res.writeHead(404);
            res.end();
            return;
        }
        if (logging) {
            console.log('{"ip": "' + req.connection.remoteAddress + '","host": "' + host + '","url":"' + req.url + '"}');
        }
        for (let i = 0; i < domains.length; i++) {
            if ((host + '') === domains[i].url) {
                if (logging) {
                    console.log("proxied to " + domains[i].port);
                }
                apiProxy.web(req, res, { target: 'http://localhost:' + domains[i].port });
                return;
            }
        }
        res.writeHead(404);
        res.end();
    } catch (e) {
        if (logging) {
            console.log(e);
        }
        res.writeHead(500);
        res.end();
    }
}

const server = https.createServer({
    key: fs.readFileSync(__dirname + '/privkey.pem'),
    cert: fs.readFileSync(__dirname + '/fullchain.pem')
}, proxyHandler);

server.listen(443, function () {
    console.log('proxy listening on port 443');
});