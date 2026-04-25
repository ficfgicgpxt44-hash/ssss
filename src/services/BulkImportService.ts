import { CaseService } from './CaseService';
import { Case } from '../types';

export const BulkImportService = {
  /**
   * Imports multiple cases into Firebase
   * Each case should have: title, category, description, images array
   */
  importCases: async (cases: Omit<Case, 'id' | 'createdAt'>[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    console.log(`[v0] Starting bulk import of ${cases.length} cases`);
    
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < cases.length; i++) {
      try {
        const caseData = cases[i];
        const result = await CaseService.addCase(caseData);
        
        if (result) {
          console.log(`[v0] (${i + 1}/${cases.length}) ✓ Imported: ${caseData.title}`);
          success++;
        } else {
          const error = `Failed to add case: ${caseData.title}`;
          console.error(`[v0] (${i + 1}/${cases.length}) ✗ ${error}`);
          errors.push(error);
          failed++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[v0] (${i + 1}/${cases.length}) ✗ Error: ${errorMsg}`);
        errors.push(errorMsg);
        failed++;
      }
      
      // Add small delay between imports to avoid rate limiting
      if (i < cases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[v0] Bulk import complete: ${success} successful, ${failed} failed`);
    return { success, failed, errors };
  },

  /**
   * Imports cases from JSON files (blob URLs or raw JSON)
   */
  importFromJSON: async (jsonData: any): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    try {
      // Handle both array and single object
      const casesToImport = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      // Validate cases have required fields
      const validCases = casesToImport.filter((c: any) => {
        if (!c.title || !c.category || !c.description) {
          console.warn(`[v0] Skipping case: missing required fields`, c);
          return false;
        }
        return true;
      });

      if (validCases.length === 0) {
        return { success: 0, failed: casesToImport.length, errors: ['No valid cases found'] };
      }

      return await BulkImportService.importCases(validCases);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[v0] Error importing from JSON:', errorMsg);
      return { success: 0, failed: 1, errors: [errorMsg] };
    }
  },

  /**
   * Batch import with progress tracking
   */
  importWithProgress: async (
    cases: Omit<Case, 'id' | 'createdAt'>[],
    onProgress: (current: number, total: number) => void
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    console.log(`[v0] Starting batch import of ${cases.length} cases with progress tracking`);
    
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < cases.length; i++) {
      try {
        const caseData = cases[i];
        const result = await CaseService.addCase(caseData);
        
        if (result) {
          success++;
        } else {
          const error = `Failed to add case: ${caseData.title}`;
          errors.push(error);
          failed++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(errorMsg);
        failed++;
      }
      
      // Call progress callback
      onProgress(i + 1, cases.length);
      
      // Add delay between imports
      if (i < cases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { success, failed, errors };
  },
};
