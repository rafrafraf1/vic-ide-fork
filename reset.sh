#!/bin/sh

set -ex

rm -rf node_modules
rm -f `find . -name '*.tsbuildinfo'`
rm -f package-lock.json
npm install
