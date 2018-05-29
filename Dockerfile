FROM node:alpine
LABEL maintainer="Charlie Lewis <clewis@iqt.org>"

RUN apk update && apk add git yarn
COPY . /app
WORKDIR /app

RUN yarn install
RUN yarn run build
RUN yarn global add serve

EXPOSE 5000
ENTRYPOINT ["serve"]
CMD ["-s", "build", "-l", "5000"]
