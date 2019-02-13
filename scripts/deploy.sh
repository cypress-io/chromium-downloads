#!/bin/bash

if [ $TRAVIS_BRANCH == 'master' ] ; then
    scp -r ./build/* $scp_dest
fi
