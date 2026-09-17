// Utility to write image base64 into /public/assets
import fs from 'fs';
import path from 'path';

console.log("Checking assets directory...");
const assetsDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}
