#!/usr/bin/env node

/**
 * Script to bulk import JSON cases into Firebase
 * Usage: node scripts/import-cases.js
 */

const fs = require('fs');
const path = require('path');

// Load Firebase config
const configPath = path.join(__dirname, '../firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error('[ERROR] firebase-applet-config.json not found');
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Define all case files to import
const caseFiles = [
  { file: 'case_open_apex_1776908704669-r5Lok.json', title: 'OPEN APEX' },
  { file: 'case_hopeless_case_1776908418308-eicKj.json', title: 'hopeless case' },
  { file: 'case_curved_roots_1_1776907353567-IDyUe.json', title: 'CURVED ROOTS 1' },
  { file: 'case_open_apex_1776907093272-80W0r.json', title: 'OPEN APEX 2' },
  { file: 'case_upper_4_5_1776908242791-THoXz.json', title: 'upper 4&5' },
  { file: 'case_upper_6_1776908589308-MzyuM.json', title: 'upper 6' },
  { file: 'case_broken_file_retrival_2_1776905994935-jrGCp.json', title: 'broken file retrieval 2' },
  { file: 'case_lower_6_1776908156712-QLfQm.json', title: 'lower 6' },
  { file: 'case_lower_5_1776908525380-olP1r.json', title: 'lower 5' },
  { file: 'case_upper_4_1776908266376-Hy36D.json', title: 'upper 4' },
  { file: 'case_broken_file_retrival_3_1776906300117-6OuhM.json', title: 'broken file retrieval 3' },
  { file: 'case_lower_8__1776908103150-ZILb9.json', title: 'lower 8' },
  { file: 'case_broken_file_bypass_2_1776906538150-ZUs1a.json', title: 'broken file bypass 2' },
  { file: 'case_re_ttt_with_indirect_composite_overlay_1776907590310-uMcgP.json', title: 'RE-TTT with indirect composite overlay' },
  { file: 'case_re_ttt_with_closed_crown_lengthening_1776907519138-ph23m.json', title: 'RE-TTT with closed crown lengthening' },
  { file: 'case_broken_file_retrival_4_1776906985506-qak3o.json', title: 'broken file retrieval 4' },
  { file: 'case_split_upper_5_1776908203690-Y96kC.json', title: 'split upper 5' },
  { file: 'case_upper_4_5_1776908637472-fofMq.json', title: 'upper 4&5 2' },
  { file: 'case_broken_file_retrival_1_1776905346226-0NUsC.json', title: 'broken file retrieval 1' },
  { file: 'case_broken_file_bypass_1_1776906390730-nJ0d1.json', title: 'broken file bypass 1' },
];

async function importCases() {
  console.log('[v0] Starting Firebase bulk import...');
  console.log(`[v0] Loading ${caseFiles.length} cases from local files`);

  try {
    // Dynamically import Firebase modules
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const casesRef = collection(db, 'cases');

    let successCount = 0;
    let errorCount = 0;

    // Import each case
    for (const caseItem of caseFiles) {
      try {
        const caseFilePath = path.join(__dirname, '../public/cases', caseItem.file);
        
        // Try multiple possible locations
        let caseData = null;
        const possiblePaths = [
          caseFilePath,
          path.join(__dirname, '..', caseItem.file),
          path.join(__dirname, '../src/data', caseItem.file),
        ];

        for (const tryPath of possiblePaths) {
          if (fs.existsSync(tryPath)) {
            const fileContent = fs.readFileSync(tryPath, 'utf8');
            caseData = JSON.parse(fileContent);
            console.log(`[v0] Found case at: ${tryPath}`);
            break;
          }
        }

        if (!caseData) {
          console.warn(`[v0] Case file not found: ${caseItem.file}, skipping...`);
          errorCount++;
          continue;
        }

        // Add to Firestore with auto-generated ID
        const docRef = await addDoc(casesRef, {
          ...caseData,
          createdAt: serverTimestamp(),
          importedAt: new Date().toISOString(),
          importSource: 'bulk-import',
        });

        console.log(`[v0] ✓ Imported: ${caseData.title || caseItem.title} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.error(`[v0] ✗ Failed to import ${caseItem.file}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n[v0] Import complete!`);
    console.log(`[v0] Successfully imported: ${successCount} cases`);
    console.log(`[v0] Failed: ${errorCount} cases`);
    console.log(`[v0] All cases are now visible publicly in the gallery!`);

    process.exit(successCount > 0 ? 0 : 1);
  } catch (error) {
    console.error('[v0] Fatal error during import:', error);
    process.exit(1);
  }
}

// Run the import
importCases().catch(error => {
  console.error('[v0] Unhandled error:', error);
  process.exit(1);
});
