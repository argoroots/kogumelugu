#!/bin/bash

# set -o errexit -o nounset


export SOURCE_DIR=./source
export BUILD_DIR=./build
export TMP_DIR=./tmp


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
export VIDEOS_YAML=${TMP_DIR}/videos.yaml
export ENTU_QUERY="_type.string.regex=interview|story&limit=10000"
./node_modules/entu-ssg/helpers/entu2yaml.js ${VIDEOS_YAML}

export REGIONS_YAML=${TMP_DIR}/regions.yaml
export ENTU_QUERY="_type.string=region&props=lat,lng,name_et,name_en,name_ru&limit=10000"
./node_modules/entu-ssg/helpers/entu2yaml.js ${REGIONS_YAML}

export TCREGIONS_YAML=${TMP_DIR}/timecodedRegions.yaml
export ENTU_QUERY="_type.string=timecodedregion&props=_parent,region,time&limit=10000"
./node_modules/entu-ssg/helpers/entu2yaml.js ${TCREGIONS_YAML}

export PERSONS_YAML=${TMP_DIR}/persons.yaml
export ENTU_QUERY="_type.string=person&limit=10000"
./node_modules/entu-ssg/helpers/entu2yaml.js ${PERSONS_YAML}


echo
echo --------- MARKERS - join videos, regions and timecodedRegionsregions
export VIDEO_DATA_YAML=${SOURCE_DIR}/video/data.yaml
node ./join_regions.js


echo
echo --------- BUILD
./node_modules/entu-ssg/build.js ./entu-ssg.yaml


echo
echo --------- PICTURES
export PICTURES_YAML=${SOURCE_DIR}/video/data.yaml
export PICTURES_DIR=${BUILD_DIR}/assets/images
node ./fetch_pictures.js
echo
echo --------- DONE
