set SOURCE_DIR="./source"
set TMP_SOURCE_DIR="./tmp_source"
set BUILD_DIR="./build"
set THUMBS_DIR="%BUILD_DIR%/thumbnails"
set ENTU_URL="https://kogumelugu.entu.ee"


# before_script:
echo
echo --------- PREFETCH
rmdir /s /q %TMP_SOURCE_DIR%
mkdir %TMP_SOURCE_DIR%
robocopy %SOURCE_DIR% %TMP_SOURCE_DIR% /e

rmdir /s /q %BUILD_DIR%
mkdir %BUILD_DIR%

rmdir /s /q %BUILD_DIR%/assets
mkdir -p %BUILD_DIR%/assets
robocopy ./assets/* %BUILD_DIR%/assets /e

robocopy ./_redirects %BUILD_DIR%/_redirects

mkdir %THUMBS_DIR%

npm install entu-cms vimeo


# script:
echo
echo --------- FETCH
set E_DEF=""
# set E_DEF="(story,interview)"
set PARENT_EID="1150"
set ITEM_DIR="%SOURCE_DIR%/video/_video"
set ITEM_YAML="video.yaml"
set OUT_DIR="%TMP_SOURCE_DIR%/video"
set LIST_YAML="%TMP_SOURCE_DIR%/data/videos.yaml"
node ./node_modules/entu-cms/helpers/entu2yaml.js

set E_DEF=""
# set E_DEF="(institution,person)"
set PARENT_EID="1178"
set ITEM_DIR=""
set ITEM_YAML=""
set OUT_DIR="%TMP_SOURCE_DIR%/"
set LIST_YAML="%TMP_SOURCE_DIR%/data/partners.yaml"
node ./node_modules/entu-cms/helpers/entu2yaml.js

set E_DEF=""
# set E_DEF="institution"
set PARENT_EID="1179"
set ITEM_DIR=""
set ITEM_YAML=""
set OUT_DIR="%TMP_SOURCE_DIR%/"
set LIST_YAML="%TMP_SOURCE_DIR%/data/sponsors.yaml"
node ./node_modules/entu-cms/helpers/entu2yaml.js

set E_DEF=""
# set E_DEF="person"
set PARENT_EID="1863"
set ITEM_DIR=""
set ITEM_YAML=""
set OUT_DIR="%TMP_SOURCE_DIR%/"
set LIST_YAML="%TMP_SOURCE_DIR%/data/team.yaml"
node ./node_modules/entu-cms/helpers/entu2yaml.js

set E_DEF=""
# set E_DEF="person"
set PARENT_EID="1180"
set ITEM_DIR=""
set ITEM_YAML=""
set OUT_DIR="%TMP_SOURCE_DIR%/"
set LIST_YAML="%TMP_SOURCE_DIR%/data/supporters.yaml"
node ./node_modules/entu-cms/helpers/entu2yaml.js

set E_DEF=""
# set E_DEF="person"
set PARENT_EID="1177"
set ITEM_DIR=""
set ITEM_YAML=""
set OUT_DIR="%TMP_SOURCE_DIR%/"
set LIST_YAML="%TMP_SOURCE_DIR%/data/coproducers.yaml"
node ./node_modules/entu-cms/helpers/entu2yaml.js


set E_DEF=""
# set E_DEF="institution"
set PARENT_EID="3326"
set ITEM_DIR=""
set ITEM_YAML=""
set OUT_DIR="%TMP_SOURCE_DIR%/"
set LIST_YAML="%TMP_SOURCE_DIR%/data/producers.yaml"
node ./node_modules/entu-cms/helpers/entu2yaml.js


echo
echo --------- PICTURES
set TMP_SOURCE_DIR="./tmp_source"
set VIDEOS_YAML="%TMP_SOURCE_DIR%/data/videos.yaml"
set PICTURES_DIR="%THUMBS_DIR%"
node ./pictures.js


echo
echo --------- BUILD
node ./node_modules/entu-cms/build.js ./entu-cms.yaml
