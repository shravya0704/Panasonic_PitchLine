import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import DashboardSidebar from "../components/admin/DashboardSidebar";
import ProductsPage from "../components/admin/ProductsPage";
import ProposalLeadsPage from "../components/admin/ProposalLeadsPage";
import SettingsPage from "../components/admin/SettingsPage";
import AdminSeriesManagement from "../components/admin/AdminSeriesManagement";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [selectedPage, setSelectedPage] = useState("Products");

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const renderPage = () => {
    switch (selectedPage) {
      case "Products":
        return <ProductsPage />;

      case "Series":
        return <AdminSeriesManagement />;

      case "Leads":
        return <ProposalLeadsPage />;

      case "Settings":
        return <SettingsPage />;

      default:
        return <ProductsPage />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      <DashboardSidebar
        selected={selectedPage}
        onSelect={setSelectedPage}
        onLogout={logout}
      />

      <div
        style={{
          flex: 1,
          padding: 40,
          background: "#F5F7FA",
          overflowY: "auto",
        }}
      >
        {renderPage()}
      </div>
    </div>
  );
}