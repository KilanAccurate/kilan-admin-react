// src/layouts/AdminLayout.jsx or .tsx
import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "src/components/AppSidebar";
import DashboardHeader from "src/components/DashboardHeader";
import { SidebarProvider, SidebarInset } from "src/components/ui/sidebar";

export function AdminLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardHeader />
                <Outlet /> {/* React Router will render child routes here */}
            </SidebarInset>
        </SidebarProvider>
    );
}
