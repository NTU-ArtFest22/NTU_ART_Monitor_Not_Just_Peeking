START=93

# USE_PROCD=1
# PROG="$APIServerPath"/node_modules/forever/bin/forever

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

# start_instance() {
#   procd_open_instance
#   procd_set_param command "$PROG" --input "start --sourceDir=$APIServerPath app.js"
#   procd_close_instance
# }

# start_service() {
#   echo "forever service start"
#   config_foreach start_instance 'foreverBoot'
# }

# service_triggers() {
#   procd_add_reload_trigger 'foreverBoot'
# }

boot() {
  echo "forever boot up"
  start
}


