import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/admin/DashboardSidebar";
import ProductsPage from "../components/admin/ProductsPage";
import LeadsPage from "../components/admin/LeadsPage";

function SettingsPage() {
  return <div>Settings</div>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [selectedPage, setSelectedPage] =
    useState("Products");

  const logout = () => {
    sessionStorage.removeItem(
      "adminLoggedIn"
    );

    navigate("/admin");
  };

  const renderPage = () => {
    switch (selectedPage) {
      case "Products":
        return <ProductsPage />;

      case "Leads":
        return <LeadsPage />;

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