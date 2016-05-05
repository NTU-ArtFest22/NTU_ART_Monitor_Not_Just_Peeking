//debug use
var noFirmata = false;
//constant
var topicPrefix = 'robot';
var firmataAdaptorName = 'firmata';
var mqttAdaptorName = 'server';
var deviceDriverKey = 'driver';
var deviceNameKey = 'name';
var devicePinKey = 'pin';
var robotTypes = {
  large: "large"
};

var extend = require('util')._extend;
var Cylon = require('cylon');
var fs = require('fs');
var serverAddr = '140.112.91.176';
var serverPort = '1883';
var deviceConfigJsonArray;
var initConfig = {
  channel: { driver: 'mqtt', topic: "defined later", connection: mqttAdaptorName }
};

var robotInfo = JSON.parse(fs.readFileSync('./robotInfo.json'));
var robotID = robotInfo.id;
var robotType = robotInfo.type;

var os = require('os');
var arduinoPort;
if(is7688()) {
  arduinoPort = '/dev/ttyS0';
}
else if(isOSX()) {
  arduinoPort = '/dev/tty.usbmodem1411';
}
else if(isLinux()) {
  arduinoPort = '/dev/ttyACM0';
}

var deviceConfig = parseDeviceConfig(initConfig, getRobotDevicesConfigName(robotType));
var phyCtrl = require("./physicalControl.js");
var authInfo = JSON.parse(fs.readFileSync('./authInfo.json'));

var robotCtrlClass = require(getRobotCtrlFileName(robotType));
var robotCtrl;

var adaptorsToConnect = {
    server: { 
      adaptor: 'mqtt', 
      host: 'mqtt://' + serverAddr + ':' + serverPort, 
      username: authInfo.username, 
      password: authInfo.password
    }
};

if(!noFirmata) {
  adaptorsToConnect[firmataAdaptorName] = { adaptor: 'firmata', port: arduinoPort };
}

Cylon.robot({
  connections: adaptorsToConnect,
 
  devices: deviceConfig,
  
  work: function(my) {
    console.log("start to work!");
    if(noFirmata) {
      robotCtrl = robotCtrlClass(noFirmata, null, my.devices, deviceConfig, my.channel);
    }
    else {
      robotCtrl = robotCtrlClass(noFirmata, my.connections[firmataAdaptorName], my.devices, deviceConfig, my.channel);
    }
    my.channel.on('message', robotCtrl.msgHandler);
    my.channel.publish(JSON.stringify({
      status: (topicPrefix + robotID) + " connected"
    }));
    
  }
  
}).start();

function getRobotDevicesConfigName(robotType) {
  return "./type_" + robotType + "_devices.json";
}

function getRobotCtrlFileName(robotType) {
  return "./type_" + robotType + "_robot.js";
}

function parseDeviceConfig(initConfig, filePath) {
  var content = fs.readFileSync(filePath);
  deviceConfigJsonArray = JSON.parse(content);
  initConfig.channel.topic = topicPrefix + robotID;
  var deviceConfig = extend({}, initConfig); //copy from init config
  
  for(var i = 1;i < deviceConfigJsonArray.length;i++) {
    var singleDeviceConfig = deviceConfigJsonArray[i];
    if(deviceDriverKey in singleDeviceConfig && deviceNameKey in singleDeviceConfig && devicePinKey in singleDeviceConfig) {
      var deviceConfigKey = singleDeviceConfig[deviceNameKey];
      deviceConfig[deviceConfigKey] = {};
      deviceConfig[deviceConfigKey][deviceDriverKey] = singleDeviceConfig[deviceDriverKey];
      deviceConfig[deviceConfigKey][devicePinKey] = singleDeviceConfig[devicePinKey];
      deviceConfig[deviceConfigKey]["connection"] = firmataAdaptorName;
    }
    else {
      console.log('no ' + deviceDriverKey + ' or ' + deviceNameKey + ' or ' + devicePinKey + ',please specify it in ' + filePath);
      exit(-1);
    }
  }
  
  return deviceConfig;
}

function is7688() {
  return (os.platform() === "linux" && os.arch() === "mipsel");
}

function isOSX() {
  return (os.platform() === "darwin");
}

function isLinux() {
  return (os.platform() === "linux");
}
