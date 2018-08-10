const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

function sanitizeData(data){
  return DOMPurify.sanitize(data);
}

module.exports = {
  sanitizeData: sanitizeData
}