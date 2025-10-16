// tools/generate_files_json.js
// Node 16+ script that scans ./files/* (folders) and produces files/files.json
const fs = require('fs');
const path = require('path');

const FILES_ROOT = path.join(__dirname, '..', 'files');
const OUT_PATH = path.join(FILES_ROOT, 'files.json');

function walkDir(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => d.name);
}

function build() {
  if (!fs.existsSync(FILES_ROOT)) {
    console.error('files/ folder not found. Creating an empty files/ directory.');
    fs.mkdirSync(FILES_ROOT, { recursive: true });
  }

  const entries = fs.readdirSync(FILES_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const categories = entries.map(catName => {
    const catPath = path.join(FILES_ROOT, catName);
    const files = walkDir(catPath)
      .filter(n => n !== 'files.json')
      .map(filename => {
        return {
          name: filename,
          title: filename,
          description: '',
          path: `files/${encodeURIComponent(catName)}/${encodeURIComponent(filename)}`
        };
      });

    return { name: catName, items: files };
  });

  // if no subfolders, try to use any files directly in files/ as single category
  if (categories.length === 0) {
    const files = walkDir(FILES_ROOT).map(filename => ({
      name: filename,
      title: filename,
      description: '',
      path: `files/${encodeURIComponent(filename)}`
    }));
    categories.push({ name: 'Files', items: files });
  }

  const out = { categories };
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', OUT_PATH);
}

build();
