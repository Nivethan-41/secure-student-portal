const DOMPurify = require('isomorphic-dompurify');

/**
 * Recursively sanitizes strings within an object, array, or string 
 * using DOMPurify to prevent XSS attacks.
 * @param {*} data - The data to sanitize
 * @returns {*} The sanitized data
 */
const sanitizeOutput = (data) => {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeOutput(item));
  }
  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeOutput(value);
    }
    return sanitizedObj;
  }
  return data;
};

module.exports = { sanitizeOutput };
