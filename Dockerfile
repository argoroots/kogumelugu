FROM node:4-slim

ADD ./ /usr/src/kogumelugu
RUN cd /usr/src/kogumelugu && npm --silent --production install

CMD ["node", "/usr/src/kogumelugu/master.js"]
