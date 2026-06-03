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
  
  // Replace: fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/...
  // With: const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  // fetch(`${API_BASE}/api/...

  // But simpler: just replace `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`
  // with `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`

  content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}/g, 
    "${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\\/$/, '')}");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed trailing slashes in ' + file);
  }
});
