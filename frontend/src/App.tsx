import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login";

  return (
    <div className="flex h-screen">
      {!hideSidebar && <Sidebar />}

      <div className="flex-1 h-full">
        <Routes>
          <Route path="/dashboard" element = {<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;