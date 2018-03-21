# Visualizer

[![Build Status](https://travis-ci.org/CyberReboot/CRviz.svg?branch=master)](https://travis-ci.org/CyberReboot/CRviz)

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
