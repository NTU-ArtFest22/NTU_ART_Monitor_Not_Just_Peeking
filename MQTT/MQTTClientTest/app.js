var serverAddr = '140.112.30.46';

var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://' + serverAddr);
 
// var payload = JSON.stringify({
//     sender: 'self'
// });
 
client.on('connect', function () {
  client.subscribe('/api/robots/cybot/commands/toggle');
//   client.publish('toggle', 'Hello mqtt');
});
 
client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());
});

var keypress = require('keypress');
 
// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    client.end();
    process.exit();
  }
  else if(key.name == 't') {
    client.publish('/api/robots/cybot/commands/toggle', null);
  }
});
 
process.stdin.setRawMode(true);
process.stdin.resume();