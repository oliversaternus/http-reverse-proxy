# http-reverse-proxy
a simple and easily configurable nodeJS reverse-proxy using the http-proxy npm package. It proxies https to http using a configurable routing table and also proxies websocket connections.

## How to use
- install nodeJS: https://nodejs.org/en/download/
- install pm2: https://pm2.keymetrics.io/docs/usage/quick-start/
- clone project
- in project folder run command: npm i
- create a SSL certificate with certbot
- in project folder create a "config.json" file, similar to the provided "example-config.json" file. This file specifies the routing table, options and the paths to your certificates.
- make sure your firewall is configured to open the port 443
- in project folder start the proxy server via command: pm2 start proxy.js --name proxy -i max
- if you want to redirect http to https securely via status code 302 also run the command: pm2 start redirect.js --name redirect -i max
- if you want to change the routing table at any time, edit the config.json file and then restart the proxy via the command: pm2 restart proxy
