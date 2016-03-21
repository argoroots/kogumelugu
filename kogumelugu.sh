#!/bin/bash

mkdir -p /data/kogumelugu/code
cd /data/kogumelugu/code

git clone -q https://github.com/argoroots/kogumelugu.git ./
git checkout -q master
git pull

printf "\n\n"
version=`date +"%y%m%d.%H%M%S"`
docker build --quiet --pull --tag=kogumelugu:$version ./ && docker tag kogumelugu:$version kogumelugu:latest

printf "\n\n"
docker stop kogumelugu
docker rm kogumelugu
docker run -d \
    --net="entu" \
    --name="kogumelugu" \
    --restart="always" \
    --cpu-shares=256 \
    --memory="1g" \
    --env="NODE_ENV=production" \
    --env="VERSION=$version" \
    --env="PORT=80" \
    --env="ENTU_USER=" \
    --env="ENTU_KEY=" \
    --env="VIMEO_ID=" \
    --env="VIMEO_SECRET=" \
    --env="VIMEO_TOKEN=" \
    --env="NEW_RELIC_APP_NAME=kogumelugu" \
    --env="NEW_RELIC_LICENSE_KEY=" \
    --env="NEW_RELIC_LOG=stdout" \
    --env="NEW_RELIC_LOG_LEVEL=error" \
    --env="NEW_RELIC_NO_CONFIG_FILE=true" \
    --env="SENTRY_DSN=" \
    kogumelugu:latest

printf "\n\n"
docker exec nginx /etc/init.d/nginx reload
