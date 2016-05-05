var serverAddr = '140.112.91.176:1883';
var mqtt = require('mqtt');
var fs = require('fs');
var authInfo = JSON.parse(fs.readFileSync('./authInfo.json'));
var client  = mqtt.connect('mqtt://' + serverAddr, authInfo);

var topic = 'robot123';
var cmdBuf = {
  uid: "unknown",
  target: "eyeServo",
  rotate: "start"
};

// var cmdBuf = {
//   uid: "unknown",
//   target: "testRelay",
// };


client.on('connect', function () {
  console.log("connected");
  cmdBuf.uid = client.options.clientId;
  client.subscribe(topic);
  client.publish(topic, JSON.stringify(cmdBuf));
});
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString());
});

// var keypress = require('keypress');
// var currentAngle = 10;
// // make `process.stdin` begin emitting "keypress" events 
// keypress(process.stdin);
 
// // listen for the "keypress" event 
// process.stdin.on('keypress', function (ch, key) {
//   if (key && key.ctrl && key.name == 'c') {
//     client.end();
//     process.exit();
//   }
//   else if(key.name == 't') {
//     currentAngle += 10;
//     cmdBuf["angle"] = currentAngle.toString();
//     client.publish(topic, JSON.stringify(cmdBuf));
//   }
//   else if(key.name == 'g') {
//     currentAngle -= 10;
//     cmdBuf["angle"] = currentAngle.toString();
//     client.publish(topic, JSON.stringify(cmdBuf));
//   }
// });
 
// process.stdin.setRawMode(true);
// process.stdin.resume();