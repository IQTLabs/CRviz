FROM node:alpine
LABEL maintainer="rashley-iqt <rashley@iqt.org>"

RUN apk update
COPY . /app
WORKDIR /app

RUN npm i npm@latest -g
RUN npm install --no-optional
RUN npm run build
RUN npm i -g serve

EXPOSE 5000
ENTRYPOINT ["serve"]
CMD ["-s", "build", "-l", "5000"]