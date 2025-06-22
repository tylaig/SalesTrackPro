import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  FileText,
  UserCircle,
  LogOut,
  Shield,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: TrendingUp },
  { name: "Vendas", href: "/sales", icon: ShoppingCart },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Relatórios", href: "/reports", icon: FileText },
  { name: "Super Admin", href: "/super-admin", icon: Shield },
];

interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'hidden' : 'block'} md:block w-64 bg-surface shadow-lg h-screen fixed md:sticky md:top-0 z-40 overflow-y-auto`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <TrendingUp className="text-primary mr-2 h-6 w-6" />
            Dashboard Vendas
          </h1>
        </div>
      
      <nav className="mt-6">
        <div className="px-6 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-primary">
            <UserCircle className="text-primary h-8 w-8" />
            <div>
              <p className="text-sm font-medium text-gray-800">João Silva</p>
              <p className="text-xs text-gray-500">Cliente Premium</p>
            </div>
          </div>
        </div>
        
        <ul className="space-y-2 px-4">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/" && location === "/dashboard");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Logout Button */}
        {onLogout && (
          <div className="px-4 mt-auto pb-6">
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </div>
        )}
      </nav>
    </aside>
    
    {/* Overlay for mobile */}
    {!isCollapsed && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        onClick={() => setIsCollapsed(true)}
      />
    )}
  </>
  );
}
