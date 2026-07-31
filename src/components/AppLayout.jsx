import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
