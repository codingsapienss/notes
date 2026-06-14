import React, { useEffect, useState, useRef } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { Palette, ChevronDown } from 'lucide-react';

const themes = [
  { name: 'Classic Green', value: 'default', color: '#2e8555' },
  { name: 'Ocean Blue', value: 'blue', color: '#3578e5' },
  { name: 'Midnight Purple', value: 'purple', color: '#a061ff' },
  { name: 'Solarized Orange', value: 'orange', color: '#e67e22' },
  { name: 'Rose Pink', value: 'rose', color: '#e91e63' },
  { name: 'Cyber Cyan', value: 'cyan', color: '#0891b2' },
];

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const savedTheme = localStorage.getItem('theme-color') || 'default';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme-color', savedTheme);

      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const setTheme = (theme) => {
    const selected = themes.find(t => t.value === theme) || themes[0];
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme-color', theme);
    document.documentElement.style.setProperty('--ifm-color-primary-rgb', hexToRgb(selected.color));
    localStorage.setItem('theme-color', theme);
    setIsOpen(false);
  };

  const selectedTheme = themes.find(t => t.value === currentTheme) || themes[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}>
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
        <Palette size={16} color={selectedTheme.color} />
        <span>Theme</span>
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
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: currentTheme === t.value ? 'var(--ifm-color-emphasis-100)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--ifm-font-color-base)',
                fontSize: '0.9rem',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ifm-color-emphasis-200)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = currentTheme === t.value ? 'var(--ifm-color-emphasis-100)' : 'transparent')}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.color }} />
              <span style={{ fontWeight: currentTheme === t.value ? '600' : '400' }}>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
