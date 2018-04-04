# CRviz

[![Build Status](https://travis-ci.org/CyberReboot/CRviz.svg?branch=master)](https://travis-ci.org/CyberReboot/CRviz)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6fe34768060e4f75a9ad8d20c0c31fec)](https://www.codacy.com/app/CyberReboot/CRviz?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=CyberReboot/CRviz&amp;utm_campaign=Badge_Grade)
[![Docker Hub Downloads](https://img.shields.io/docker/pulls/cyberreboot/crviz.svg)](https://hub.docker.com/u/cyberreboot)

## Build and run using Docker

```
docker build -t crviz .
docker run -dp 80:5000 crviz
```

## Project Structure

- `src/domain` contains Redux reducers, action creators, selectors, and any other domain specific functions.
  [redux-actions](https://github.com/redux-observable/redux-observable) is being used to reduce boilerplate.

- `src/epics` contains [redux-observable](https://github.com/redux-observable/redux-observable)

- `src/features` contains React components organized by features.
