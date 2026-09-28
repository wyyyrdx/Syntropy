import React from 'react';

const SUBJECTS = [
  { id: 'geo', space: 'geography', href: '/', label: 'GEO' },
  { id: 'phy', space: 'physics', href: '/physics.html', label: 'PHY' },
  { id: 'bio', space: 'biology', href: '/biology.html', label: 'BIO' },
  { id: 'his', space: 'history', href: '/history.html', label: 'HIS' }
];

export default function SubjectSwitcher({ active, onSwitch }) {
  const handleClick = (e, subject) => {
    if (onSwitch) {
      e.preventDefault();
      onSwitch(subject.space);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded p-0.5">
      {SUBJECTS.map((subject) => {
        const on = subject.id === active;
        return (
          <a
            key={subject.id}
            href={subject.href}
            onClick={(e) => handleClick(e, subject)}
            className={`font-pixel text-[8px] px-1.5 py-1 rounded no-underline cursor-pointer ${
              on ? 'bg-slate-700 text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {subject.label}
          </a>
        );
      })}
    </div>
  );
}
