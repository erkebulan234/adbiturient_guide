import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);

  function toggle(program) {
    setItems(prev => {
      const exists = prev.find(p => p.id === program.id);
      if (exists) return prev.filter(p => p.id !== program.id);
      if (prev.length >= 3) return prev; // максимум 3
      return [...prev, program];
    });
  }

  function isSelected(programId) {
    return items.some(p => p.id === programId);
  }

  function clear() {
    setItems([]);
  }

  return (
    <CompareContext.Provider value={{ items, toggle, isSelected, clear }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}