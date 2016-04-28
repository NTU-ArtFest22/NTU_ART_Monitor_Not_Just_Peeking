var serverAddr = '140.112.91.176';
var mqtt    = require('mqtt');
var fs = require('fs');
var authInfo = JSON.parse(fs.readFileSync('./authInfo.json'));
var client  = mqtt.connect('mqtt://' + serverAddr, authInfo);

var topic = 'robot123';
var cmdBuf = {
  servo: "test",
  angle: "0"
};

client.on('connect', function () {
  client.subscribe(topic);
  client.publish(topic, 'for test');
  console.log('subscribed');
});
 
client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());
});

var keypress = require('keypress');
var currentAngle = 10;
// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    client.end();
    process.exit();
  }
  else if(key.name == 't') {
    currentAngle += 10;
    cmdBuf["angle"] = currentAngle.toString();
    client.publish(topic, JSON.stringify(cmdBuf));
  }
  else if(key.name == 'g') {
    currentAngle -= 10;
    cmdBuf["angle"] = currentAngle.toString();
    client.publish(topic, JSON.stringify(cmdBuf));
  }
});
 
process.stdin.setRawMode(true);
process.stdin.resume();