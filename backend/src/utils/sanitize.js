const xss = require('xss');

const sanitizeOutput = (data) => {
  if (typeof data === 'string') {
    return xss(data);
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
