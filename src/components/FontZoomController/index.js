import React, {useEffect, useState} from 'react';
import {Minus, Plus} from 'lucide-react';

const FONT_SCALE_KEY = 'docusaurus-font-scale';
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.6;
const STEP = 0.1;

export default function FontZoomController() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem(FONT_SCALE_KEY);
    const initial = saved ? parseFloat(saved) : 1;
    setScale(initial);
    document.documentElement.style.setProperty('--font-scale', String(initial));
  }, []);

  const applyScale = (newScale) => {
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    setScale(clamped);
    localStorage.setItem(FONT_SCALE_KEY, String(clamped));
    document.documentElement.style.setProperty('--font-scale', String(clamped));
  };

  const increase = () => applyScale(Math.round((scale + STEP) * 10) / 10);
  const decrease = () => applyScale(Math.round((scale - STEP) * 10) / 10);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '8px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        marginLeft: '8px',
      }}
      role="group"
      aria-label="Font size controller"
    >
      <button
        onClick={decrease}
        disabled={scale <= MIN_SCALE}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: scale <= MIN_SCALE ? 'not-allowed' : 'pointer',
          color: 'var(--ifm-font-color-base)',
          opacity: scale <= MIN_SCALE ? 0.4 : 1,
          padding: '4px 6px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s ease',
        }}
        title="Decrease font size"
        aria-label="Decrease font size"
      >
        <Minus size={16} />
      </button>

      <span
        style={{
          fontSize: '11px',
          color: 'var(--ifm-color-emphasis-600)',
          fontWeight: 600,
          minWidth: '24px',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {Math.round(scale * 100)}%
      </span>

      <button
        onClick={increase}
        disabled={scale >= MAX_SCALE}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: scale >= MAX_SCALE ? 'not-allowed' : 'pointer',
          color: 'var(--ifm-font-color-base)',
          opacity: scale >= MAX_SCALE ? 0.4 : 1,
          padding: '4px 6px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s ease',
        }}
        title="Increase font size"
        aria-label="Increase font size"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}