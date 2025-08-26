import { Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './TopNavigation/Navbar.tsx';
import SideNav from './SideNavigation/SideNav.tsx';
import Home from './Pages/Home/Home.tsx';
import Profile from './Pages/Profile/Profile.tsx';
import ManagementPage from './Pages/SensorManagement/ManagementPage.tsx';
import Login from './Pages/Authentication/SignIn.tsx';
import Register from './Pages/Authentication/Register.tsx';
import ForgotPassword from './Pages/Authentication/ForgotPassword.tsx';
import SensorMap from './Pages/SensorMapping/SensorMap.tsx';
import ManageUsers from './Pages/UserManagement/ManageUsers.tsx';
import LogsPage from './Pages/Logs/LogPage.tsx';
import Unauthorised from './Pages/Redirects/Unauthorised.tsx';
import NotFound from './Pages/Redirects/NotFound.tsx';
import ProtectedRoute from '../context/ProtectedRoute.tsx';
import ExportData from './Pages/ExportData/ExportData.tsx';
import SenmaticEnrichment from './Pages/SemanticEnrichment/SemanticEnrichment.tsx';

const PageContainer: React.FC = () => {
  const [sideNavMenu, setsideNavMenu] = useState<boolean>(false);

  return (
    <div className="page-container">
      <Navbar
        sideNavMenu={sideNavMenu}
        setsideNavMenu={setsideNavMenu}
      />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/semantic-enrichment" element={<SenmaticEnrichment/>} />
        <Route
          path="/sensor-platform"
          element={<ManagementPage page="sensor-platform"/>}
        />
        <Route
          path="/sensor-platform-type"
          element={<ManagementPage page="sensor-platform-type"/>}
        />
        <Route
          path="/observable-properties"
          element={<ManagementPage page="observable-properties"/>}
        />
        <Route path="/units-of-measurement"
        element={<ManagementPage page="units-of-measurement"/>}
        />
        <Route path="/sensor-platform-config"
          element={<ManagementPage page="sensor-platform-config"/>}
        />
        <Route path="/signin" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/sensor-mapping" element={<SensorMap/>} />
        <Route path="/export-data" element={<ExportData />} />

        {/* Protected Routes */}
        <Route path="/manage-users" element={<ProtectedRoute role="admin" />}>
          <Route path="/manage-users" element={<ManageUsers />} />
        </Route>

        <Route path="/logs" element={<ProtectedRoute role={["admin", "sensortech"]} />}>
          <Route path="/logs" element={<LogsPage />} />
        </Route>

        <Route path="/profile" element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Redirect Routes */}
        <Route path="/unauthorised" element={<Unauthorised />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* put the navbar below all the content so it is rendered last */}
      {sideNavMenu && (
        <SideNav setsideNavMenu={setsideNavMenu} />
      )}
    </div>
  );
};

export default PageContainer;