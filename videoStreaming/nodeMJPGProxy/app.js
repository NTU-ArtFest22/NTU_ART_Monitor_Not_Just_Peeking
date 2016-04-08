var MjpegProxy = require('mjpeg-proxy').MjpegProxy;
var express = require('express');
var app = express();

app.get('/index1.jpg', new MjpegProxy('http://140.112.91.176:8090/?action=stream').proxyRequest);
app.listen(8080);