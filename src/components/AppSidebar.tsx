// src/components/AppSidebar.jsx
import {
    LogOutIcon,
    PaperclipIcon,
    SettingsIcon,
    TimerIcon,
    Users,
    WorkflowIcon,
} from "lucide-react";


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "./ui/sidebar"; // adjust relative path accordingly

import { useAuth } from "../context/AuthContext"; // adjusted relative import

import { Button } from "./ui/button";
import { useLocation } from "react-router-dom"; // React Router alternative to next/navigation usePathname
import { NavMain } from "./NavMain";

const navItems = [
    {
        title: "Akun",
        icon: Users,
        href: "/admin/users",
        isActive: true,
    },
    {
        title: "Absensi",
        icon: TimerIcon,
        href: "/admin/absensi",
    },
    {
        title: "Lembur",
        icon: WorkflowIcon,
        href: "/admin/lembur",
    },
    {
        title: "Cuti",
        icon: PaperclipIcon,
        href: "/admin/cuti",
    },
    {
        title: "Setting",
        icon: SettingsIcon,
        href: "/admin/settings",
    },
];

export default function AppSidebar() {
    const { logout, isLoggedIn, isLoading: isAuthLoading } = useAuth();

    // React Router hook to get current path
    const location = useLocation();

    // Optionally, you can update navItems to mark active based on location.pathname

    const handleLogout = () => {
        logout();
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            {/* Add logo or content here if needed */}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} currentPath={location.pathname} />
            </SidebarContent>
            <SidebarFooter>
                <Button onClick={handleLogout} variant="secondary">
                    <LogOutIcon /> Logout
                </Button>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
