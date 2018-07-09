/*
mock of DOM environment forcing mocha tests to use jsdom allowing exposure of
implicit DOM objects during test calls.  The main use is so that we don't get test errors 
in cases where the code calls things like window.alert.  
*/
process.env.NODE_ENV = 'test'

/*const { JSDOM } = require('jsdom')
var exposedProperties = ['window', 'navigator', 'document'];
console.log(jsdom);

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};*/ 

const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  window.alert = (msg) => { console.log(msg); }
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