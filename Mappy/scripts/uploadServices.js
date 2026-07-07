import fs from 'fs';
import path from 'path';
import process from 'process';
import admin from 'firebase-admin';

// Usage: node ./scripts/uploadServices.js /path/to/serviceAccountKey.json
// Ensure you run: npm install firebase-admin

const keyPath = process.argv[2];
if (!keyPath) {
  console.error('Provide path to Firebase service account JSON (node scripts/uploadServices.js ./serviceAccountKey.json)');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(keyPath), 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  try {
    const dataPath = path.resolve('src/assets/data/emergencyData.js');
    // Import the dataset by evaluating the file and extracting the export
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    // Very small parser: look for "export const expandedEmergencyData =" and evaluate the RHS
    const match = fileContents.match(/export const expandedEmergencyData = ([\s\S]*);\s*$/m);
    if (!match) throw new Error('Could not parse expandedEmergencyData from emergencyData.js');
    // eslint-disable-next-line no-eval
    const dataArray = eval('(' + match[1] + ')');

    const colRef = db.collection('services');

    for (const item of dataArray) {
      const docId = (item.name || 'service').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
      await colRef.doc(docId).set(item);
      console.log('Wrote', docId);
    }
    console.log('Done uploading', dataArray.length, 'documents');
    process.exit(0);
  } catch (e) {
    console.error('Upload failed', e);
    process.exit(1);
  }
})();
