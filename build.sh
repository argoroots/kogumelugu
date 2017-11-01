#!/bin/bash

# set -o errexit -o nounset


export SOURCE_DIR=./source
export BUILD_DIR=./build


echo
echo --------- PREFETCH
rm -rf ${BUILD_DIR}
mkdir -p ${BUILD_DIR}/assets
cp -r ./assets/* ${BUILD_DIR}/assets
cp ./_redirects ${BUILD_DIR}/_redirects

rm -r node_modules
npm install -q entu-ssg
npm install -q vimeo


echo
echo --------- FETCH
export ENTU_TYPE=interview
# export ENTU_PARENT=743
./node_modules/entu-ssg/helpers/entu2yaml.js ${SOURCE_DIR}/video/data.yaml


echo
echo --------- BUILD
./node_modules/entu-ssg/build.js ./entu-ssg.yaml


echo
echo --------- PICTURES
export PICTURES_YAML=${SOURCE_DIR}/video/data.yaml
export PICTURES_DIR=${BUILD_DIR}/assets/images
node ./pictures.js
echo
echo --------- DONE
