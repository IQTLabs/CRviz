FROM node:alpine
LABEL maintainer="Charlie Lewis <clewis@iqt.org>"

RUN apk update && apk add git yarn
COPY . /app
WORKDIR /app

RUN npm i npm@latest -g
RUN npm install --no-optional
RUN yarn run build
RUN yarn global add serve

EXPOSE 5000
ENTRYPOINT ["serve"]
CMD ["-s", "build", "-l", "5000"]