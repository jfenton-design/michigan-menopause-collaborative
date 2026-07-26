import * as React from 'react';

/** Green confirmation strip shown after a successful save (?saved=1). */
export function SavedBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{ background: '#EAF4EA', borderBottom: '1px solid #b7ddb7', padding: '12px 40px', fontSize: 14, color: '#2d6a2d' }}>
      ✓ Saved — changes may take about a minute to appear on michiganmenopause.com.
    </div>
  );
}
