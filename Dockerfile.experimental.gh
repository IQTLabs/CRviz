FROM node:alpine
LABEL maintainer="rashley-iqt <rashley@iqt.org>"

RUN apk update && apk add git
RUN git config --global user.email "rashley@iqt.org"
RUN git config --global user.name "rashley-iqt"

COPY . /app
WORKDIR /app
RUN sed -i '2i\
  "homepage": "https:\/\/rashley-iqt.github.io\/CRviz", \
' package.json

RUN npm i npm@latest -g
RUN npm install --no-optional
RUN npm run build

# this step will insert google analytics tracking code into the index.html file as the
# last item before closing the head tag
RUN sed -i "s:</head>:<script async src=\"https\://www.googletagmanager.com/gtag/js?id=UA-101050083-2\"></script>\
\n\t\t<script> \n\t\t\twindow.dataLayer = window.dataLayer || []; \n\t\t\t\
function gtag(){dataLayer.push(arguments);} \n\t\t\tgtag('js', new Date()); \n\n\t\t\tgtag('config', 'UA-101050083-2'); \
 \n\t\t</script> \n\t</head>:" build/index.html

CMD npm run deploy-experimental
