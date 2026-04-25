import { Case } from '../types';

export const FirebaseCaseService = {
  async getCases(): Promise<Case[]> {
    return [];
  },

  async addCase(newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> {
    return null;
  },

  async updateCase(id: string, updates: Partial<Case>): Promise<void> {
    return;
  },

  async deleteCase(id: string): Promise<void> {
    return;
  }
};
