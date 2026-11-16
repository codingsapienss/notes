import React, {useEffect, useState, useRef} from 'react';
import {Minus, Plus, Type} from 'lucide-react';

const FONT_SCALE_KEY = 'docusaurus-font-scale';
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.6;
const STEP = 0.1;

export default function FontZoomController() {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FONT_SCALE_KEY);
      const initial = saved ? parseFloat(saved) : 1;
      setScale(initial);
      document.documentElement.style.setProperty('--font-scale', String(initial));

      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
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
    <div ref={dropdownRef} style={{position: 'relative', display: 'flex', alignItems: 'center', height: '100%'}}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--ifm-color-emphasis-100)',
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '20px',
          padding: '4px 12px',
          cursor: 'pointer',
          color: 'var(--ifm-font-color-base)',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
        }}
        title="Adjust font size"
      >
        <Type size={16} />
        <span>Font</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            backgroundColor: 'var(--ifm-background-surface-color)',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '8px',
            boxShadow: 'var(--ifm-global-shadow-md)',
            zIndex: 1000,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '160px',
          }}
        >
          <button
            onClick={decrease}
            disabled={scale <= MIN_SCALE}
            style={{
              background: 'var(--ifm-color-emphasis-100)',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              cursor: scale <= MIN_SCALE ? 'not-allowed' : 'pointer',
              color: 'var(--ifm-font-color-base)',
              opacity: scale <= MIN_SCALE ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Decrease font size"
          >
            <Minus size={16} />
          </button>

          <span
            style={{
              fontSize: '13px',
              color: 'var(--ifm-color-emphasis-600)',
              fontWeight: 600,
              minWidth: '40px',
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
              background: 'var(--ifm-color-emphasis-100)',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              cursor: scale >= MAX_SCALE ? 'not-allowed' : 'pointer',
              color: 'var(--ifm-font-color-base)',
              opacity: scale >= MAX_SCALE ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Increase font size"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  );
}