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

export TAGS_YAML=${TMP_DIR}/tags.yaml
export ENTU_QUERY="_type.string=tag&props=name_en,name_et,name_ru,_parent&limit=999"
node ./node_modules/entu-ssg/helpers/entu2yaml.js ${TAGS_YAML}

export REGIONS_YAML=${TMP_DIR}/regions.yaml
export ENTU_QUERY="_type.string=region&props=lat,lng,name_en,name_et,name_ru,_parent&limit=999"
node ./node_modules/entu-ssg/helpers/entu2yaml.js ${REGIONS_YAML}

export PERSONS_YAML=${TMP_DIR}/persons.yaml
export ENTU_QUERY="_type.string=person&props=forename,surname&limit=999"
node ./node_modules/entu-ssg/helpers/entu2yaml.js ${PERSONS_YAML}

export TCTAGS_YAML=${TMP_DIR}/timecodedTags.yaml
export ENTU_QUERY="_type.string=timecodedtag&limit=999"
node ./node_modules/entu-ssg/helpers/entu2yaml.js ${TCTAGS_YAML}

export TCREGIONS_YAML=${TMP_DIR}/timecodedRegions.yaml
export ENTU_QUERY="_type.string=timecodedregion&props=_parent,region,time&limit=999"
node ./node_modules/entu-ssg/helpers/entu2yaml.js ${TCREGIONS_YAML}

export VIDEOS_YAML=${TMP_DIR}/videos.yaml
export ENTU_QUERY="_type.string.regex=interview|story&props=author,category,description_en,description_et,description_ru,interview,language,path,photo,project,storyteller,subtitle_en,subtitle_et,subtitle_ru,title_en,title_et,title_ru,videoUrl&limit=999"
node ./node_modules/entu-ssg/helpers/entu2yaml.js ${VIDEOS_YAML}

export CATEGORIES_YAML=${TMP_DIR}/categories.yaml
export ENTU_QUERY="_type.string=category&props=color,description,name&limit=999"
node ./node_modules/entu-ssg/helpers/entu2yaml.js ${CATEGORIES_YAML}

export LANGUAGES_YAML=${TMP_DIR}/languages.yaml
export ENTU_QUERY="_type.string=language&props=name&limit=999"
node ./node_modules/entu-ssg/helpers/entu2yaml.js ${LANGUAGES_YAML}


echo
echo --------- COMPILE DATA

export VIDEO_DATA_YAML=${SOURCE_DIR}/video/data.yaml
export TAG_DATA_YAML=${SOURCE_DIR}/tags/tags.yaml
export REGION_DATA_YAML=${SOURCE_DIR}/tags/regions.yaml
export PERSON_DATA_YAML=${SOURCE_DIR}/tags/persons.yaml
export HIERARCHY_DATA_YAML=${SOURCE_DIR}/tags/h.yaml
node ./compile_video_data.js


echo
echo --------- BUILD
node ./node_modules/entu-ssg/build.js ./entu-ssg.yaml


echo
echo --------- PICTURES
export PICTURES_YAML=${SOURCE_DIR}/video/data.yaml
export PICTURES_DIR=${BUILD_DIR}/assets/images
node ./fetch_pictures.js


rm -rf ${TMP_DIR}


echo
echo --------- DONE
