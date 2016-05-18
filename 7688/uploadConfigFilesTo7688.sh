deviceName=$1
remoteDirPath="/Media/SD-P1/CylonMQTTAPIServer"
scp ./CylonMQTTAPIServer/robotInfo.json root@$deviceName:$remoteDirPath
scp ./CylonMQTTAPIServer/contServoInfo.json root@$deviceName:$remoteDirPath
scp ./CylonMQTTAPIServer/ACMotorInfo.json root@$deviceName:$remoteDirPath
