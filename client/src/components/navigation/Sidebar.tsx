import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Users, FileText, Shield, Webhook, X, Menu } from "lucide-react";
import { UserCircle, LogOut } from "lucide-react";

interface SidebarProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  } | null;
}

export default function Sidebar({ onLogout, isOpen = false, onClose, user }: SidebarProps) {
  const isAdmin = user?.role === 'admin';
  const [location] = useLocation();
  


  return (
    <>
      {/* Sidebar */}
      <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white shadow-lg h-screen fixed top-0 left-0 z-40 overflow-y-auto transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <TrendingUp className="text-primary mr-2 h-6 w-6" />
            Dashboard Vendas
          </h1>
        </div>
      
        <nav className="flex flex-col h-full">
          <div className="px-6 mb-6 mt-6">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-primary">
              <UserCircle className="text-primary h-8 w-8" />
              <div>
                <p className="text-sm font-medium text-gray-800">João Silva</p>
                <p className="text-xs text-gray-500">Cliente Premium</p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4">
            <ul className="space-y-1">
              <li>
                <Link href="/">
                  <div className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    location === '/' || location === '/dashboard'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <TrendingUp className="mr-3 h-5 w-5" />
                    Dashboard
                  </div>
                </Link>
              </li>

              <li>
                <Link href="/sales">
                  <div className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    location === '/sales' 
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Vendas
                  </div>
                </Link>
              </li>

              <li>
                <Link href="/clients">
                  <div className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    location === '/clients' 
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <Users className="mr-3 h-5 w-5" />
                    Clientes
                  </div>
                </Link>
              </li>

              <li>
                <Link href="/reports">
                  <div className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    location === '/reports' 
                      ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <FileText className="mr-3 h-5 w-5" />
                    Relatórios
                  </div>
                </Link>
              </li>

              {isAdmin && (
                <li>
                  <Link href="/super-admin">
                    <div className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                      location === '/super-admin' 
                        ? 'bg-red-50 text-red-700 border-l-4 border-red-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                      <Shield className="mr-3 h-5 w-5" />
                      Super Admin
                    </div>
                  </Link>
                </li>
              )}

              <li>
                <Link href="/webhook-test">
                  <div className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    location === '/webhook-test' 
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <Webhook className="mr-3 h-5 w-5" />
                    Webhook Test
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
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
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}