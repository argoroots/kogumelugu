#!/bin/bash

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
