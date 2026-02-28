import React from 'react';
import { useAnteater } from './useAnteater.js';

export default function AnteaterButton() {
  const { active, loading, error, toggle } = useAnteater();

  // Three visual states: loading probe, active (despawn), inactive (spawn)
  const label = loading
    ? '...'
    : active
    ? '🐜 Dismiss Anteater'
    : '🐜 Begin!';

  const bg = active ? '#e53e3e' : '#f0b429';

  return (
    <div style={{ padding: '0 0 8px' }}>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          width          : '100%',
          padding        : '10px 0',
          backgroundColor: loading ? '#ccc' : bg,
          color          : '#fff',
          border         : 'none',
          borderRadius   : '8px',
          cursor         : loading ? 'default' : 'pointer',
          fontWeight     : 'bold',
          fontSize       : '14px',
          letterSpacing  : '0.3px',
          transition     : 'background-color 0.15s',
        }}
      >
        {label}
      </button>

      {/* Status hint shown when the anteater is live */}
      {active && !loading && (
        <p style={{
          margin    : '6px 0 0',
          fontSize  : '11px',
          color     : '#666',
          textAlign : 'center',
        }}>
          Drag to pick up · Release to throw!
        </p>
      )}

      {/* Error hint — usually means the content script isn't injected yet */}
      {error && (
        <p style={{
          margin    : '6px 0 0',
          fontSize  : '11px',
          color     : '#c53030',
          textAlign : 'center',
        }}>
          ⚠️ Reload the page and try again
        </p>
      )}
    </div>
  );
}
