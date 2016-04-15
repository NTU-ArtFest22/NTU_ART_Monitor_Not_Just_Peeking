//-- config
var deviceIndex = 1;

//--

var config = require('config');
var deviceConfigs = config.get('DeviceConfigs');
var mcs = require('mcsjs');
console.log(deviceConfigs[deviceIndex]);

var app = mcs.register(deviceConfigs[deviceIndex]);
app.on('servoControl', function(data, time) {
   console.log('time:' + time + ',data' + data); 
});

app.on('testSwitch', function(data, time) {
   console.log('time:' + time + ',data' + data); 
});