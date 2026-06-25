import {
  Routes,
  Route,
} from "react-router-dom";

import ConfiguratorPage from "./pages/ConfiguratorPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<ConfiguratorPage />}
      />

      <Route
        path="/admin"
        element={<AdminLogin />}
      />

      <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
      
    </Routes>
  );
}

export default App;