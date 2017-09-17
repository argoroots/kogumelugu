#!/bin/bash

# set -o errexit -o nounset

export SOURCE_DIR=./source
export TMP_SOURCE_DIR=./tmp_source
export BUILD_DIR=./build
export THUMBS_DIR=${BUILD_DIR}/thumbnails

export ENTU_URL=https://kogumelugu.entu.ee

source ./secure.sh

# before_script:
echo
echo --------- PREFETCH
rm -rf ${TMP_SOURCE_DIR}
mkdir ${TMP_SOURCE_DIR}
cp -r ${SOURCE_DIR}/* ${TMP_SOURCE_DIR}

rm -rf ${BUILD_DIR}
mkdir ${BUILD_DIR}

rm -rf ${BUILD_DIR}/assets
mkdir -p ${BUILD_DIR}/assets
cp -r ./assets/* ${BUILD_DIR}/assets

cp ./_redirects ${BUILD_DIR}/_redirects

mkdir -p ${THUMBS_DIR}


# npm install entu-cms vimeo


source ./fetch.sh


source ./pictures.sh


echo
echo --------- BUILD
./node_modules/entu-cms/build.js ./entu-cms.yaml
