import React from 'react';
import { Keyboard } from './Icons';

export const ShortcutsPanel = () => {
  const shortcuts = [
    { label: 'New Task', keys: ['Alt', 'N'] },
    { label: 'Close', keys: ['Esc'] },
    { label: 'Delete', keys: ['Del'] },
  ];

  return (
    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 mt-4">
      <div className="flex items-center gap-2 mb-3 text-gray-500">
        <Keyboard className="w-4 h-4" />
        <span className="text-xs font-bold tracking-wider">SHORTCUTS</span>
      </div>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">{shortcut.label}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, kIndex) => (
                <kbd key={kIndex} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-sans text-gray-500 min-w-[20px] text-center shadow-sm">
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
