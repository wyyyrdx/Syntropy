import React from 'react';

const SUBJECTS = [
  { id: 'geo', href: '/', label: 'GEO' },
  { id: 'phy', href: '/physics.html', label: 'PHY' },
  { id: 'bio', href: '/biology.html', label: 'BIO' }
];

export default function SubjectSwitcher({ active }) {
  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded p-0.5">
      {SUBJECTS.map((subject) => {
        const on = subject.id === active;
        return (
          <a
            key={subject.id}
            href={subject.href}
            className={`font-pixel text-[8px] px-1.5 py-1 rounded no-underline ${
              on ? 'bg-slate-700 text-amber-300' : 'text-slate-400'
            }`}
          >
            {subject.label}
          </a>
        );
      })}
    </div>
  );
}
