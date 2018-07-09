/*
mock of DOM environment forcing mocha tests to use jsdom allowing exposure of
implicit DOM objects during test calls.  The main use is so that we don't get test errors 
in cases where the code calls things like window.alert.  
*/
process.env.NODE_ENV = 'test'

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  window.alert = (msg) => {  }
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce((result, prop) => ({
      ...result,
      [prop]: Object.getOwnPropertyDescriptor(src, prop),
    }), {});
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
copyProps(window, global);

configure({ adapter: new Adapter() });