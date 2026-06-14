import React, { useEffect, useState, useRef } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { Sparkles, ChevronDown } from 'lucide-react';

const styles = [
  { name: 'Minimalism', value: 'minimalism' },
  { name: 'Glassmorphism', value: 'glassmorphism' },
  { name: 'Neo-Brutalism', value: 'brutalism' },
  { name: 'Claymorphism', value: 'claymorphism' },
  { name: 'Skeuomorphism', value: 'skeuomorphism' },
  { name: 'Liquid Glass', value: 'liquid' },
];

export default function StyleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('minimalism');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const savedStyle = localStorage.getItem('site-style') || 'minimalism';
      setCurrentStyle(savedStyle);
      document.documentElement.setAttribute('data-site-style', savedStyle);

      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const setStyle = (style) => {
    setCurrentStyle(style);
    document.documentElement.setAttribute('data-site-style', style);
    localStorage.setItem('site-style', style);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', marginLeft: '8px' }}>
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
      >
        <Sparkles size={16} color="var(--ifm-color-primary)" />
        <span>Style</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
            minWidth: '180px',
            padding: '8px 0',
            overflow: 'hidden',
          }}
        >
          {styles.map((s) => (
            <button
              key={s.value}
              onClick={() => setStyle(s.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: currentStyle === s.value ? 'var(--ifm-color-emphasis-100)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--ifm-font-color-base)',
                fontSize: '0.9rem',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ifm-color-emphasis-200)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = currentStyle === s.value ? 'var(--ifm-color-emphasis-100)' : 'transparent')}
            >
              <span style={{ fontWeight: currentStyle === s.value ? '600' : '400' }}>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
