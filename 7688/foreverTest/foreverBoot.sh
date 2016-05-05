#!/bin/sh /etc/rc.common
# Example script
# Copyright (C) 2007 OpenWrt.org
 
START=10
STOP=15
APIServerPath="/Media/SD-P1/CylonMQTTAPIServer"

start() {        
  echo "forever started"
  export PATH=$PATH:"$APIServerPath"/node_modules/forever/bin
  exec forever start --sourceDir=$APIServerPath app.js
}                 

stop() {          
  echo "forever stopped"
  export PATH=$PATH:"$APIServerPath"/node_modules/forever/bin
  exec forever stop --sourceDir=$APIServerPath app.js
}

boot() {
  echo "forever boot up"
}