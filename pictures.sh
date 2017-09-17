#!/bin/bash

echo
echo --------- PICTURES
export TMP_SOURCE_DIR=./tmp_source
export VIDEOS_YAML=${TMP_SOURCE_DIR}/data/videos.yaml
export PICTURES_DIR=${THUMBS_DIR}
node ./pictures.js
