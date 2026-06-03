const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*''\}/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}');
  content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}');

  // Replace ending single quote with backtick
  content = content.replace(/\/api\/([a-zA-Z0-9\/-]+)',/g, '/api/$1`,');
  content = content.replace(/\/api\/([a-zA-Z0-9\/-]+)'/g, '/api/$1`');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed syntax in ' + file);
  }
});
