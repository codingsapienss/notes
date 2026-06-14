import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const themes = [
  { name: 'Default', value: 'default', color: '#2e8555' },
  { name: 'Deep Sea', value: 'blue', color: '#3578e5' },
  { name: 'Midnight', value: 'purple', color: '#a061ff' },
  { name: 'Solarized', value: 'orange', color: '#e67e22' },
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const savedTheme = localStorage.getItem('theme-color') || 'default';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme-color', savedTheme);
    }
  }, []);

  const setTheme = (theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme-color', theme);
    localStorage.setItem('theme-color', theme);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px' }}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          title={t.name}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: currentTheme === t.value ? '2px solid var(--ifm-color-emphasis-900)' : '1px solid var(--ifm-color-emphasis-300)',
            backgroundColor: t.color,
            cursor: 'pointer',
            padding: 0,
            transition: 'transform 0.1s ease',
            transform: currentTheme === t.value ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}
