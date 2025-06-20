import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  ChartLine, 
  ShoppingCart, 
  Users, 
  Headset, 
  FileText, 
  UserCircle 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: ChartLine },
  { name: "Vendas", href: "/sales", icon: ShoppingCart },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Suporte", href: "/support", icon: Headset },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
          <ChartLine className="text-primary mr-2" size={24} />
          Dashboard Vendas
        </h1>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-primary">
            <UserCircle className="text-primary" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-800">João Silva</p>
              <p className="text-xs text-gray-500">Cliente Premium</p>
            </div>
          </div>
        </div>
        
        <ul className="space-y-2 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            
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
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
