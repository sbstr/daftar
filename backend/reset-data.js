const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'data', 'db.json');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Deleted data/db.json. Start the server to recreate demo data.');
} else {
  console.log('No data/db.json file found.');
}
