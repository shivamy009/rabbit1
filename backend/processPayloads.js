const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const processPayload = require('./utils/processPayload');

async function processAllPayloads(directory, io) {
  const files = await fs.readdir(directory);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = JSON.parse(await fs.readFile(path.join(directory, file), 'utf-8'));
      await processPayload(data, io);
      console.log(`Processed ${file}`);
    }
  }
}

async function extractAndProcess(zipPath, extractPath, io) {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);
  await processAllPayloads(extractPath, io);
}

// Run this script manually to process the zip file
// extractAndProcess('../payloads.zip', '../payloads', { emit: () => {} }).catch(console.error);
module.exports = { processAllPayloads, extractAndProcess };