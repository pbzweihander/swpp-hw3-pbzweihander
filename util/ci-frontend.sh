#!/bin/bash

set -e

TYPE=$1
if [ $TYPE = 'install' ]; then
    echo '*** Installing dependencies'
    cd angular
    npm install
    cd ..
elif [ $TYPE = 'script' ]; then
    cd angular
    echo '*** Running unit tests'
    npm run test -- --code-coverage --watch false --sourceMap true --browsers ChromeHeadless
    cd ..
elif [ $TYPE = 'after_success' ]; then
    echo '*** Submitting coverage info'
    cp .coveralls.yml angular/
    cd angular
    ./node_modules/coveralls/bin/coveralls.js .. < ./coverage/lcov.info
    cd ..
fi
