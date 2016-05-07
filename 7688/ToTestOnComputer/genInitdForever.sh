tar -zxf originalForeverBoot.tar.gz
cat foreverBoot.sh > ./tmpFile
echo "#!/bin/sh /etc/rc.common" > foreverBoot.sh
echo "APIServerPath=$1" >> foreverBoot.sh
cat ./tmpFile >> foreverBoot.sh
rm ./tmpFile