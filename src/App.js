import {BrowserRouter as Router} from 'react-router-dom';
import PageContainer from "./components/PageContainer/PageContainer";
import { AuthContextProvider } from './components/context/AuthContext';

function App() {

  return (
    <div className="flex">
      <Router>
      <AuthContextProvider>
      <PageContainer/>
      </AuthContextProvider>
      </Router>
   
    </div>
  )
}

export default App
