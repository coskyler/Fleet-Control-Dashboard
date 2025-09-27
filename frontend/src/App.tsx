import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NewScan from './components/NewScan';
import Scans from './components/Scans';
import Login from './components/Login';
import Signup from './components/Signup';
import Spectate from './components/Spectate';
import Beams from './components/Beams';

function App() {
  const location = useLocation();
  const hideSidebar = false //location.pathname === "/login";

  return (
    <div className="flex h-screen">
      {!hideSidebar && <Sidebar />}

      <div className="flex-1 h-full">
        <div className="absolute inset-0 -z-10 bg-black"/>
        <div className="absolute inset-0 -z-10 opacity-50">
            <Beams
                beamWidth={2}
                beamHeight={15}
                beamNumber={12}
                lightColor="#ffffff"
                speed={2}
                noiseIntensity={1.75}
                scale={0.2}
                rotation={20}
            />
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/newscan" replace />} />

          <Route path="/dashboard" element = {<Dashboard />} />
          <Route path="/newscan" element = {<NewScan />} />
          <Route path="/scans/:scanID" element = {<Scans />} />
          <Route path="/login" element = {<Login />} />
          <Route path="/signup" element = {<Signup />} />
          <Route path="/spectate" element = {<Spectate />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;