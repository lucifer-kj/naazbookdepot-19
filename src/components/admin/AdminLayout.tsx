
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  ListOrdered, 
  Package, 
  Users, 
  Star, 
  Book, 
  Percent, 
  BarChart2, 
  Settings, 
  Grid2X2,
  LogOut, 
  Bell, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [notifications, setNotifications] = useState(3);

  // Get current page for breadcrumbs
  const pathname = location.pathname;
  const paths = pathname.split('/').filter(path => path);

  // Navigation items
  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { title: "Orders", icon: ListOrdered, path: "/admin/orders" },
    { title: "Products", icon: Package, path: "/admin/products" },
    { title: "Categories", icon: Grid2X2, path: "/admin/categories" },
    { title: "Customers", icon: Users, path: "/admin/customers" },
    { title: "Reviews", icon: Star, path: "/admin/reviews" },
    { title: "Content", icon: Book, path: "/admin/content" },
    { title: "Marketing", icon: Percent, path: "/admin/marketing" },
    { title: "Reports", icon: BarChart2, path: "/admin/reports" },
    { title: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-border/50">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="font-playfair text-xl font-bold text-naaz-green dark:text-naaz-gold">
                Naaz Admin
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.slice(0, 5).map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.path || pathname.startsWith(`${item.path}/`)}
                        tooltip={item.title}
                      >
                        <Link to={item.path}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Content & Analytics</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.slice(5).map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.path || pathname.startsWith(`${item.path}/`)}
                        tooltip={item.title}
                      >
                        <Link to={item.path}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name} />
                  <AvatarFallback className="bg-naaz-green text-white">
                    {profile?.first_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">
                  {profile?.first_name || 'Admin'}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SidebarTrigger className="md:hidden mr-2" />
                
                {/* Breadcrumbs */}
                <Breadcrumb>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/admin">Admin</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {paths.slice(1).map((path, index) => (
                    <BreadcrumbItem key={path}>
                      {index === paths.length - 2 ? (
                        <BreadcrumbLink asChild>
                          <Link 
                            to={`/${paths.slice(0, index + 2).join('/')}`}
                            className="capitalize"
                          >
                            {path}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="capitalize">{path}</span>
                      )}
                    </BreadcrumbItem>
                  ))}
                </Breadcrumb>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications > 0 ? (
                      <>
                        <div className="max-h-80 overflow-auto">
                          <DropdownMenuItem className="cursor-pointer">
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium">New order received</span>
                              <span className="text-xs text-muted-foreground">Order #12345 needs processing</span>
                              <span className="text-xs text-muted-foreground">2 minutes ago</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium">Low stock alert</span>
                              <span className="text-xs text-muted-foreground">3 products are running low on stock</span>
                              <span className="text-xs text-muted-foreground">1 hour ago</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium">New customer registered</span>
                              <span className="text-xs text-muted-foreground">Sarah Johnson created an account</span>
                              <span className="text-xs text-muted-foreground">3 hours ago</span>
                            </div>
                          </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-center text-sm font-medium"
                          onClick={() => setNotifications(0)}
                        >
                          Mark all as read
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin/settings/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
            <ScrollArea className="h-full">
              <Outlet />
            </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  );
};
