#!/bin/sh /etc/rc.common
# Example script
# Copyright (C) 2007 OpenWrt.org
 
START=10
STOP=15

start() {        
  echo "forever started"
  export PATH=$PATH:/Media/SD-P1/foreverTest/node_modules/forever/bin
  exec forever start --sourceDir=/Media/SD-P1/CylonMQTTAPIServer app.js
}                 
 
stop() {          
  echo "forever stopped"
  export PATH=$PATH:/Media/SD-P1/foreverTest/node_modules/forever/bin
  exec forever stop --sourceDir=/Media/SD-P1/CylonMQTTAPIServer app.js
}