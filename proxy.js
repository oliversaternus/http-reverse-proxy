var https = require('https');
var httpProxy = require('http-proxy');
var fs = require('fs');
var apiProxy = httpProxy.createProxyServer({ ws: true });
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

apiProxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
    proxyReq.setHeader('X-Forwarded-Proto', 'https');
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
console.log({
    privkey: fs.realpathSync(config.certificates.privkey),
    fullchain: fs.realpathSync(config.certificates.fullchain)
});
const server = https.createServer({
    key: fs.readFileSync(fs.realpathSync(config.certificates.privkey)),
    cert: fs.readFileSync(fs.realpathSync(config.certificates.fullchain))
}, proxyHandler);

server.on("upgrade", function (req, res) {
    try {
        const host = req.headers.host;
        if (!host) {
            if (logging) {
                console.log('{"ip": "' + req.connection.remoteAddress + '","address": "unknown", "event": "upgrade" }');
            }
            res.writeHead(404);
            res.end();
            return;
        }
        if (logging) {
            console.log('{"ip": "' + req.connection.remoteAddress + '","host": "' + host + '","url":"' + req.url + '", "event": "upgrade"}');
        }
        for (let i = 0; i < domains.length; i++) {
            if ((host + '') === domains[i].url) {
                if (logging) {
                    console.log("Websocket connection upgraded: " + domains[i].port);
                }
                apiProxy.ws(req, res, { target: 'http://localhost:' + domains[i].port }, function (e) {
                    if (logging && e) {
                        console.log(e);
                    }
                });
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
});

server.listen(443, function () {
    console.log('proxy listening on port 443');
});
