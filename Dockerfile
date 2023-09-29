# FROM node:current-alpine
FROM node:16.16-alpine3.16

LABEL maintainer jacob@blurt.foundation

RUN apk -U add git build-base python3 libtool libsodium autoconf automake gnupg gcc g++ make

RUN rm -vrf /var/cache/apk/*

COPY . /condenser

WORKDIR /condenser

RUN mkdir tmp && \
    npm install --legacy-peer-deps && \
    # export NODE_OPTIONS=--openssl-legacy-provider && \
    npm run build

ENV PORT 8080
ENV NODE_ENV production

CMD npm run production