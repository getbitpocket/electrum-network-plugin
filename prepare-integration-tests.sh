#!/bin/bash

COMMAND=${1:-emulate}
PLATFORM=${2:-android}

./node_modules/gulp/bin/gulp.js build

cd ..
rm -r ./electrum-network-test-app
cordova create electrum-network-test-app
cd ./electrum-network-test-app

cordova platform add $PLATFORM
cordova plugin add ../electrum-network-plugin
cordova plugin add ../electrum-network-plugin/test
cordova plugin add cordova-plugin-test-framework

rm www/index.html
cp ../electrum-network-plugin/test/test-index.html www/index.html

if [ $COMMAND == "run" ]; then
    echo "cordova run ..."
    cordova run $PLATFORM
else
    echo "cordova emulate ..."
    cordova emulate $PLATFORM
fi

