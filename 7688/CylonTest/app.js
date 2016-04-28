var serverAddr = '140.112.30.46';
var Cylon = require('cylon');

Cylon.robot({
  connections: {
    // arduino: {adaptor: 'firmata', port: '/dev/ttyS0'}
    mqtt: {adaptor: 'mqtt', host: 'mqtt://'+ serverAddr}
  },

  devices: {
    channel: { driver: 'mqtt', topic: 'robot123'}
  },

  work: function(my) {
    console.log('start working and ready to send mqtt request');
    my.channel.on('message', function(data) {
      console.log("Message on 'channel': " + data);
    });

    my.channel.publish('testing');
    // my.mqtt.publish('hello', 'testing');

  }

}).start();