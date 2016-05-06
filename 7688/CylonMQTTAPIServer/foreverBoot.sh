START=93

start() {        
  echo "forever started"
  export PATH=$PATH:"$APIServerPath"/node_modules/forever/bin
  exec forever start --sourceDir=$APIServerPath -l "$APIServerPath"/out.log -o "$APIServerPath"/appOut.log -e "$APIServerPath"/appErr.log --uid "NJP" app.js
}                 

stop() {          
  echo "forever stopped"
  export PATH=$PATH:"$APIServerPath"/node_modules/forever/bin
  exec forever stop NJP
}

boot() {
  echo "forever boot up"
  start
}


