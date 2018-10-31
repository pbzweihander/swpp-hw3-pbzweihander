#!/bin/bash

set -e

TYPE=$1
if [ $TYPE = 'install' ]; then
    echo '*** Installing dependencies'
    pip install -r ./django/requirements.txt
    pip install -r ./django/requirements.dev.txt
elif [ $TYPE = 'before_script' ]; then
    echo '*** Setting up Django'
    export PROJECT_PATH=$(pwd)/django/myblog
    cd django
    python manage.py migrate
    cd ..
elif [ $TYPE = 'script' ]; then
    cd django
    echo '*** Running unit tests'
    coverage run --branch --source="./api" manage.py test
    cp .coverage ..
    cd ..
elif [ $TYPE = 'after_success' ]; then
    echo '*** Submitting coverage info'
    coveralls
fi
