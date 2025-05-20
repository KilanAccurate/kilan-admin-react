// src/components/NavMain.tsx or .jsx

import React from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "./ui/collapsible";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "./ui/sidebar";

interface NavItem {
    title: string;
    href: string;
    icon?: React.ElementType;
    isActive?: boolean;
    items?: {
        title: string;
        href: string;
        isActive?: boolean;
    }[];
}

interface NavMainProps {
    items: NavItem[];
    currentPath: string;  // <-- add this here
}

export function NavMain({ items, currentPath }: NavMainProps) {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const Icon = item.icon;

                        if (item.items && item.items.length > 0) {
                            return (
                                <Collapsible key={item.title} className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton isActive={item.href === currentPath}>
                                                {Icon && <Icon className="size-4" />}
                                                <span>{item.title}</span>
                                                <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={subItem.href === currentPath}>
                                                            <Link to={subItem.href}>{subItem.title}</Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        }

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={item.href === currentPath}>
                                    <Link to={item.href}>
                                        {Icon && <Icon className="size-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
