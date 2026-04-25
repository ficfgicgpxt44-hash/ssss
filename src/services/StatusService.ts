import { Status } from '../types';

export const StatusService = {
  getStatuses: async (): Promise<Status[]> => {
    try {
      const response = await fetch('/api/statuses');
      if (!response.ok) throw new Error('Failed to fetch statuses');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  addStatus: async (image: string, caption: string): Promise<Status | null> => {
    try {
      const response = await fetch('/api/statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, caption })
      });
      if (!response.ok) throw new Error('Failed to add status');
      return await response.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  deleteStatus: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/statuses/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
};
