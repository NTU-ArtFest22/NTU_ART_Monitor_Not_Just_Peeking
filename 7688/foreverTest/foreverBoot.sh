content="\
#!/bin/sh /etc/rc.common
# Example script
# Copyright (C) 2007 OpenWrt.org
 
START=93
APIServerPath=$1

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

# start_service() {
#   echo "forever service start"
#   start
# }

boot() {
  echo "forever boot up"
  start
}

# service_triggers() {
#   procd_add_reload_trigger
# }
"

echo $content > test.sh