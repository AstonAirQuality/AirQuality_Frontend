import React, { createContext, useContext } from 'react';
import useDarkMode from '../../hooks/useDarkMode.tsx';

const DarkModeContext = createContext<[boolean, (enabled: boolean) => void] | undefined>(undefined);

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useDarkMode();
  return (
    <DarkModeContext.Provider value={[enabled, setEnabled]}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkModeContext = () => {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error('useDarkModeContext must be used within a DarkModeProvider');
  return context;
};