// src/components/DashboardHeader.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { SidebarTrigger } from "./ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
// import { ModeToggle } from "./mode-toggle"; // Uncomment if you use this

function toTitleCase(segment: string): string {
    return segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char: string) => char.toUpperCase());
}

export default function DashboardHeader() {
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter(Boolean); // remove empty segments

    const currentPage = toTitleCase(pathSegments[pathSegments.length - 1] || "Dashboard");

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin">
                                Admin
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            {/* <ModeToggle /> */}
        </header>
    );
}
