#!/bin/bash

echo "service_name: travis-pro" > .coveralls.yml
echo "repo_token: $COVERALLS_TOKEN" >> .coveralls.yml

if [ $TEST = 'BACKEND' ]; then
    echo "*** Configuration: Backend"
    exec ./util/ci-backend.sh $1
elif [ $TEST = 'FRONTEND' ]; then
    echo "*** Configuration: Frontend"
    exec ./util/ci-frontend.sh $1
fi
