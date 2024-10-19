import {Route, Routes} from 'react-router-dom';
import {useState} from 'react';
import Navbar from './TopNavigation/Navbar';
import SideNav from './SideNavigation/SideNav';
import Home from './Pages/Home/Home';
import Profile from './Pages/Profile/Profile';
import ManagementPage from './Pages/SensorManagement/ManagementPage';
import Login from './Pages/Authentication/SignIn';
import Register from './Pages/Authentication/Register';
import ForgotPassword from './Pages/Authentication/ForgotPassword';
import SensorMap from './Pages/SensorMapping/SensorMap';
import ManageUsers from './Pages/UserManagement/ManageUsers';
import LogsPage from './Pages/Logs/LogPage';
import Unauthorised from './Pages/Redirects/Unauthorised';
import NotFound from './Pages/Redirects/NotFound';
import useDarkMode from '../../hooks/useDarkMode';
import ProtectedRoute from '../context/ProtectedRoute';
import ExportData from './Pages/ExportData/ExportData';

const PageContainer = () => {
  
  const [sideNavMenu, setsideNavMenu] = useState(false);
  const [darkTheme, setDarkTheme] = useDarkMode();
    return (
        <div className= "page-container">
          <Navbar sideNavMenu = {sideNavMenu} setsideNavMenu= {setsideNavMenu} darkTheme={darkTheme} setDarkTheme={setDarkTheme}/>
          <Routes>
            <Route path='/' element={<Home darkTheme = {darkTheme} />} />
            <Route path='/sensor-platforms' element={<ManagementPage page="sensor-platforms" darkTheme={darkTheme}/>} />
            <Route path='/sensor-platform-types' element={<ManagementPage page="sensor-platform-types"  darkTheme={darkTheme}/>} />
            <Route path='/signin' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/forgot-password' element={<ForgotPassword/>} />
            <Route path='/sensor-mapping' element={<SensorMap darkTheme = {darkTheme}/>} />
          
            <Route path='/export-data' element={<ExportData/>} />

            {/* Protected Routes */}
            <Route path='/manage-users' element={<ProtectedRoute role = "admin"/>}>
              <Route path='/manage-users' element={<ManageUsers/>} />
            </Route>
            
            <Route path='/logs' element={<ProtectedRoute role = {["admin","sensortech"]}/>}>
              <Route path='/logs' element={<LogsPage/>} />
            </Route>

            <Route path='/profile' element={<ProtectedRoute/>}>
              <Route path='/profile' element={<Profile/>} />
            </Route>

             {/* Redirect Routes */}
            <Route path='/unauthorised' element={<Unauthorised/>} />
            <Route path='*' element={<NotFound/>} />
            
          </Routes>
          {/* put the navbar below all the content so it is rendered last */}
          {sideNavMenu && <SideNav sideNavMenu = {sideNavMenu} setsideNavMenu = {setsideNavMenu}/>}
        </div>
    )
}

export default PageContainer