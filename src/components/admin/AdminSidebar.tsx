
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Book,
  Search,
  Settings,
  BarChart,
  ShoppingBag,
  Tag,
  Star,
  FileText,
  Scroll,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { 
      path: "/admin/products", 
      icon: Book, 
      label: "Products",
      submenu: [
        { path: "/admin/products", label: "All Products" },
        { path: "/admin/products/create", label: "Add Product" },
        { path: "/admin/categories", label: "Categories" }
      ]
    },
    { path: "/admin/customers", icon: Users, label: "Customers" },
    { path: "/admin/reviews", icon: Star, label: "Reviews" },
    { 
      path: "/admin/content", 
      icon: FileText, 
      label: "Content",
      submenu: [
        { path: "/admin/blog", label: "Blog Posts" },
        { path: "/admin/faq", label: "FAQs" }
      ]
    },
    { path: "/admin/coupons", icon: Tag, label: "Coupons" },
    { path: "/admin/reports", icon: BarChart, label: "Reports" },
    { path: "/admin/activity", icon: Activity, label: "Activity Logs" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <Sidebar
      className="border-r border-gray-200 bg-white"
      collapsible="offcanvas"
    >
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex-1">
          <h1 className="text-xl font-playfair font-bold text-naaz-green">
            Naaz Admin
          </h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                {item.submenu ? (
                  <>
                    <SidebarMenuButton
                      isActive={isActive(item.path)}
                      tooltip={item.label}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    
                    <SidebarMenuSub>
                      {item.submenu.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.path}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === subItem.path}
                          >
                            <NavLink to={subItem.path}>
                              <span>{subItem.label}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.label}
                  >
                    <NavLink to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-4">
          <div className="text-xs text-center text-gray-500">
            Naaz Book Depot &copy; 2025
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
