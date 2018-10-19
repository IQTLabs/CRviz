# CRviz

[![Build Status](https://travis-ci.org/CyberReboot/CRviz.svg?branch=master)](https://travis-ci.org/CyberReboot/CRviz)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6fe34768060e4f75a9ad8d20c0c31fec)](https://www.codacy.com/app/CyberReboot/CRviz?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=CyberReboot/CRviz&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/CyberReboot/CRviz/branch/master/graph/badge.svg?token=ORXmFYC3MM)](https://codecov.io/gh/CyberReboot/CRviz)
[![Docker Hub Downloads](https://img.shields.io/docker/pulls/cyberreboot/crviz.svg)](https://hub.docker.com/u/cyberreboot) [![Greenkeeper badge](https://badges.greenkeeper.io/CyberReboot/CRviz.svg)](https://greenkeeper.io/)


CRviz is our first attempt at visualizing networks differently. It's still an early prototype, and it's still under development. That said, we want to share the tool in this formative stage both because we think that our approach has the potential to improve the scalability and legibility of network data, and also because we're actively looking for feedback. So please send us your suggestions and comments!

For more details, please see this [blog post](https://blog.cyberreboot.org/crviz-scalable-design-for-network-visualization-14689133fd91).

For a live demo, please check out https://cyberreboot.github.io/CRviz/

## Build and run

### With Docker

This project includes a Dockerfile for convenient building and deployment.

To build and run, use the following command:

```
docker build -t crviz .
docker run -dp 80:5000 crviz
```

### Without Docker

1. Update npm (npm install -g npm)
2. Run `npm install && npm build`

The static files in the `./build` directory should be ready for deployment.

To serve the application locally, run `npm start`.
Changes made in your code will be automatically reloaded on http://localhost:5000.

## Data Input

This tool supports loading datasets from URLs or by uploading local files. When loading dataset from a URL, ensure that [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) is enabled at that URL.

In both cases, the tool expects the data to be in the format described below.
For examples, see [`./sample_data`](./sample_data).

### Data format

| Name | Type | Required | Description |
| - | - | - | - |
| configuration | [ConfigurationObject](#configurationobject) | no | configuration for this dataset |
| dataset | array\<object\> | yes | An array of data points. All data points are expected to have the same schema. |

#### ConfigurationObject

| Name | Type | Required | Description |
| - | - | - | - |
| fields | array\<[AttributeObject](#attributeobject)\> | no | an array of attributes in this dataset. |

#### AttributeObject

| Name | Type | Required | Description |
| - | - | - | - |
| path | array\<string\> | yes | an array describing the path to the attribute in each data point. |
| displayName | string | no | the name of the attribute, default to joining the path array with `.` |
| groupable | boolean | no | whether the attribute can be used as a grouping in the hierarchy. Typically, non-categorical item should not be groupable. Default to `true` |

### Preconfigured datasets

Preconfigured datasets (displayed in the dataset dropdown) are defined in [`src/datasets.json`](src/datasets.json).

This file is expected to contain an array of objects containing the following properties:

| Name | Type   | Required | Description                                     |
| ---- | ------ | -------- | ----------------------------------------------- |
| name | string | yes      | The name of dataset (displayed in the dropdown) |
| url  | string | yes      | the URL pointing to the dataset.                |

After modifying, rebuild as described above for the changes to take effect.

## Development

This project is built with [ReactJS](https://reactjs.org) and [Redux](https://redux.js.org/) (and related libraries) as an application framework. The visualization is built using [D3.js](https://d3js.org/).

This project is a bootstrapped using [create-react-app](https://github.com/facebook/create-react-app).

Here are some quick commands to get started:

- `npm install`: Install Node dependencies
- `npm start`: Start the hot reloading development server.
- `npm test`: Run the test suit and watch for changes.
- `npm build`: Build a production optimized bundle of the app.

### Project Structure

- `src/domain` contains Redux reducers, action creators, selectors, and any other domain specific functions.
  [redux-actions](https://github.com/redux-observable/redux-observable) is being used to reduce boilerplate.

- `src/epics` contains [redux-observable](https://github.com/redux-observable/redux-observable)

- `src/features` contains React components organized by features.
