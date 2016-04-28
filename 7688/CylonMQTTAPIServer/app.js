//constant
var topicPrefix = 'robot';
var firmataAdaptorName = 'firmata';
var mqttAdaptorName = 'server';
var deviceDriverKey = 'driver';
var deviceNameKey = 'name';
var devicePinKey = 'pin';

var extend = require('util')._extend;
var Cylon = require('cylon');
var fs = require('fs');
var serverAddr = '140.112.30.46';
var serverPort = '1883';
var deviceID = '123'; //TODO: read from config
var deviceConfigJsonArray; 
var allDevices = {};
var initConfig = {
  channel: { driver: 'mqtt', topic: (topicPrefix + deviceID), connection: mqttAdaptorName }
};

var deviceConfig = parseDeviceConfig(initConfig, './devices.json');

Cylon.robot({
  connections: {
    server: { adaptor: 'mqtt', host: 'mqtt://' + serverAddr + ':' + serverPort }
    ,firmata: { adaptor: 'firmata', port: '/dev/ttyS0' }
  },
 
  devices: deviceConfig,
  
  work: function(my) {
    console.log("start to work!");
    allDevices = mappingDevices(my.devices);
    
    my.channel.on('message', this.msgHandler);
    my.channel.publish(JSON.stringify({
      status: (topicPrefix + deviceID) + " connected"
    }));
    
  },
  
  msgHandler: function (data) {
    try {
      jsonObj = JSON.parse(data);
      console.log(jsonObj);
      if('servo' in jsonObj) {
        turnServo(jsonObj);
      }
    }
    catch(err) {
      console.log(err);
    }
  }
  
}).start();


function turnMotor(data) {
  var targetDevice = 'stepper';
}

function turnServo(data) {
  var targetDevice = 'servo';
  try {
    allDevices[targetDevice][data[targetDevice]].angle(Number(data['angle']));  
  }
  catch(err) {
    console.log(err);
  }
}

function parseDeviceConfig(initConfig, filePath) {
  var content = fs.readFileSync(filePath);
  var deviceConfig = extend({}, initConfig); //copy from init config
  deviceConfigJsonArray = JSON.parse(content);
  for(var i = 0;i < deviceConfigJsonArray.length;i++) {
    var singleDeviceConfig = deviceConfigJsonArray[i];
    if(deviceDriverKey in singleDeviceConfig && deviceNameKey in singleDeviceConfig && devicePinKey in singleDeviceConfig) {
      var deviceConfigKey = singleDeviceConfig[deviceNameKey] + "_" + singleDeviceConfig[deviceDriverKey];
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

function mappingDevices(connectedDevices) {
  var devices = {};
  for(var i = 0;i < deviceConfigJsonArray.length;i++) {
    var singleDeviceConfig = deviceConfigJsonArray[i];
    if(!devices[singleDeviceConfig[deviceDriverKey]]) {
      devices[singleDeviceConfig[deviceDriverKey]] = {};
    }
    devices[singleDeviceConfig[deviceDriverKey]][singleDeviceConfig[deviceNameKey]] = connectedDevices[singleDeviceConfig[deviceNameKey] + "_" + singleDeviceConfig[deviceDriverKey]];  
  }
  
  return devices;
}
