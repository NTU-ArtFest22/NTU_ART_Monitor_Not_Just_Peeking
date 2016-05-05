folderToUpload="./foreverTest"
uploadFileName="tmpUpload"
uploadToPath="/Media/SD-P1"

tar -zcf "$uploadFileName"".tar.gz" $folderToUpload
scp "$uploadFileName"".tar.gz" root@mylinkit.local:"$uploadToPath"
rm "$uploadFileName"".tar.gz"