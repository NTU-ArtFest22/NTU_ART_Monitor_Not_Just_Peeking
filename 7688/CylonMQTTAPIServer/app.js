var Cylon = require('cylon');
var serverAddr = '140.112.30.46';

Cylon.api(
  'mqtt',
  {
    broker: 'mqtt://' + serverAddr,
    port: 1883
});

Cylon.robot({
  name: 'cybot',
  
  connections: {
    arduino: {adaptor: 'firmata', port: '/dev/ttyS0'}
  },
  
  // These are the events that will be registered in the API
  events: ['turned-on', 'turned-off', 'toggle'],

  // These are the commands that will be availble in the API
  // Commands method needs to return an object with the aliases
  // to the robot methods.
  commands: function() {
    return {
      turn_on: this.turnOn,
      turn_off: this.turnOff,
      toggle: this.toggle
    };
  },
  
  devices: {
    led: {driver: 'led', pin: 13}
  },

  work: function(my) {
    console.log("start to work!");
  },
  
  turnOn: function() {
    this.led.turnOn();
    // this.emit('turned-on');
  },

  turnOff: function() {
    this.led.turnOff();
    // this.emit('turned-off');
  },

  toggle: function() {
    this.led.toggle();
    // this.emit('toggle');
    // if (this.led.isOn()) {
    //   this.emit('turned-on');
    // } else {
    //   this.emit('turned-off');
    // }
  }
  
}).start();