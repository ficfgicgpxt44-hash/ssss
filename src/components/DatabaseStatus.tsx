import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const DatabaseStatus = () => {
  const [status, setStatus] = useState<{
    configured: boolean;
    tableExists: boolean;
    canInsert: boolean;
    errorMessage: string | null;
  }>({
    configured: false,
    tableExists: false,
    canInsert: false,
    errorMessage: null,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check if Supabase is configured
        const configured = isSupabaseConfigured();
        console.log('[v0] Supabase configured:', configured);

        if (!configured) {
          setStatus({
            configured: false,
            tableExists: false,
            canInsert: false,
            errorMessage:
              'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
          });
          return;
        }

        // Try to fetch from cases table
        const { data, error: selectError } = await supabase
          .from('cases')
          .select('count()', { count: 'exact' })
          .limit(1);

        if (selectError) {
          console.error('[v0] Select error:', selectError);
          setStatus({
            configured: true,
            tableExists: false,
            canInsert: false,
            errorMessage: `Table "cases" not found. Error: ${selectError.message}`,
          });
          return;
        }

        // Try to insert a test case
        const testId = `test-${Date.now()}`;
        const { error: insertError } = await supabase
          .from('cases')
          .insert([
            {
              id: testId,
              title: 'Test Case',
              category: 'Test',
              description: 'This is a test',
              images: [],
              createdAt: Date.now(),
            },
          ]);

        if (insertError) {
          console.error('[v0] Insert error:', insertError);
          setStatus({
            configured: true,
            tableExists: true,
            canInsert: false,
            errorMessage: `Cannot insert data. Error: ${insertError.message}`,
          });
          return;
        }

        // Delete test case
        await supabase.from('cases').delete().eq('id', testId);

        setStatus({
          configured: true,
          tableExists: true,
          canInsert: true,
          errorMessage: null,
        });
      } catch (err) {
        console.error('[v0] Unexpected error:', err);
        setStatus({
          configured: false,
          tableExists: false,
          canInsert: false,
          errorMessage: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    };

    checkStatus();
  }, []);

  return (
    <div style={{ padding: '16px', marginBottom: '16px', borderRadius: '8px', backgroundColor: '#f5f5f5' }}>
      <h3 style={{ marginTop: 0 }}>Database Status Check</h3>
      <div style={{ fontSize: '14px' }}>
        <p>
          <strong>Supabase Configured:</strong>{' '}
          <span style={{ color: status.configured ? 'green' : 'red' }}>
            {status.configured ? '✓ Yes' : '✗ No'}
          </span>
        </p>
        <p>
          <strong>Cases Table Exists:</strong>{' '}
          <span style={{ color: status.tableExists ? 'green' : 'red' }}>
            {status.tableExists ? '✓ Yes' : '✗ No'}
          </span>
        </p>
        <p>
          <strong>Can Insert Data:</strong>{' '}
          <span style={{ color: status.canInsert ? 'green' : 'red' }}>
            {status.canInsert ? '✓ Yes' : '✗ No'}
          </span>
        </p>
        {status.errorMessage && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {status.errorMessage}</p>
        )}
      </div>
    </div>
  );
};
