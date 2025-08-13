import { BrowserRouter as Router } from 'react-router-dom';
import PageContainer from "./components/PageContainer/PageContainer.tsx";
import { AuthContextProvider } from './components/context/AuthContext.tsx';
import { DarkModeProvider } from './components/context/DarkModeContext.tsx';
import React from 'react';

const App: React.FC = () => {
  return (
    <div className="flex">
      <Router>
        <AuthContextProvider>
          <DarkModeProvider>
            <PageContainer />
          </DarkModeProvider>
        </AuthContextProvider>
      </Router>
    </div>
  );
};

export default App;
