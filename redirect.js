var express = require("express");

var http = express();

http.get('*', function (req, res) {
    res.redirect('https://' + req.headers.host + req.url);
})

http.listen(80);