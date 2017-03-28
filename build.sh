#!/bin/bash

# set -o errexit -o nounset

export SOURCE_DIR=./source
export TMP_SOURCE_DIR=./tmp_source
export BUILD_DIR=./build
export THUMBS_DIR=${BUILD_DIR}/thumbnails

export ENTU_URL=https://kogumelugu.entu.ee


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

npm install entu-cms vimeo


# script:
echo
echo --------- FETCH
export E_DEF=
# export E_DEF=(story,interview)
export PARENT_EID=1150
export ITEM_DIR=${SOURCE_DIR}/video/_video
export ITEM_YAML=video.yaml
export OUT_DIR=${TMP_SOURCE_DIR}/video
export LIST_YAML=${TMP_SOURCE_DIR}/data/videos.yaml
./node_modules/entu-cms/helpers/entu2yaml.js

export E_DEF=
# export E_DEF=(institution,person)
export PARENT_EID=1178
export ITEM_DIR=
export ITEM_YAML=
export OUT_DIR=${TMP_SOURCE_DIR}/
export LIST_YAML=${TMP_SOURCE_DIR}/data/partners.yaml
./node_modules/entu-cms/helpers/entu2yaml.js

export E_DEF=
# export E_DEF=institution
export PARENT_EID=1179
export ITEM_DIR=
export ITEM_YAML=
export OUT_DIR=${TMP_SOURCE_DIR}/
export LIST_YAML=${TMP_SOURCE_DIR}/data/sponsors.yaml
./node_modules/entu-cms/helpers/entu2yaml.js

export E_DEF=
# export E_DEF=person
export PARENT_EID=1863
export ITEM_DIR=
export ITEM_YAML=
export OUT_DIR=${TMP_SOURCE_DIR}/
export LIST_YAML=${TMP_SOURCE_DIR}/data/team.yaml
./node_modules/entu-cms/helpers/entu2yaml.js

export E_DEF=
# export E_DEF=person
export PARENT_EID=1180
export ITEM_DIR=
export ITEM_YAML=
export OUT_DIR=${TMP_SOURCE_DIR}/
export LIST_YAML=${TMP_SOURCE_DIR}/data/supporters.yaml
./node_modules/entu-cms/helpers/entu2yaml.js

export E_DEF=
# export E_DEF=person
export PARENT_EID=1177
export ITEM_DIR=
export ITEM_YAML=
export OUT_DIR=${TMP_SOURCE_DIR}/
export LIST_YAML=${TMP_SOURCE_DIR}/data/coproducers.yaml
./node_modules/entu-cms/helpers/entu2yaml.js


export E_DEF=
# export E_DEF=institution
export PARENT_EID=3326
export ITEM_DIR=
export ITEM_YAML=
export OUT_DIR=${TMP_SOURCE_DIR}/
export LIST_YAML=${TMP_SOURCE_DIR}/data/producers.yaml
./node_modules/entu-cms/helpers/entu2yaml.js


echo
echo --------- PICTURES
export TMP_SOURCE_DIR=./tmp_source
export VIDEOS_YAML=${TMP_SOURCE_DIR}/data/videos.yaml
export PICTURES_DIR=${THUMBS_DIR}
node ./pictures.js


echo
echo --------- BUILD
./node_modules/entu-cms/build.js ./entu-cms.yaml
