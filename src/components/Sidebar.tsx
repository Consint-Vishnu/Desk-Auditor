import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, FileText, Clock, Users, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SidebarItemProps {
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, href, isActive, label }) => {
  return (
    <Link
      to={href}
      className={cn(
        "w-full h-12 flex items-center px-4 text-white transition-all duration-200",
        isActive ? "bg-[#477FC0]" : "hover:bg-[#033B77]"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  
  const role = user?.role || 'desk_auditor';
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-screen fixed left-0 top-0 z-10 bg-[#3472BA] transition-all duration-300",
        expanded ? "w-64" : "w-[50px]"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-[#477FC0]">
        {expanded ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-[#3472BA] font-bold">
                H
              </div>
              <span className="text-white font-bold text-lg">HITPA</span>
            </div>
            <button 
              onClick={() => setExpanded(false)}
              className="text-white hover:bg-[#033B77] p-1 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setExpanded(true)}
            className="text-white w-full flex justify-center hover:bg-[#033B77]"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        {expanded ? (
          <>
            <SidebarItem 
              icon={<FileText size={18} />} 
              href={`/dashboard/${role}`} 
              isActive={isActive('dashboard')} 
              label="Dashboard"
            />
            <SidebarItem 
              icon={<Clock size={18} />} 
              href={`/history/${role}`} 
              isActive={isActive('history')} 
              label="History"
            />
            <SidebarItem 
              icon={<Users size={18} />} 
              href={`/users/${role}`} 
              isActive={isActive('users')} 
              label="Users"
            />
            <SidebarItem 
              icon={<Settings size={18} />} 
              href={`/settings/${role}`} 
              isActive={isActive('settings')} 
              label="Settings"
            />
          </>
        ) : (
          <TooltipProvider>
            <div className="flex flex-col items-center py-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={`/dashboard/${role}`}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-white rounded-md my-1",
                      isActive('dashboard') ? "bg-[#477FC0]" : "hover:bg-[#033B77]"
                    )}
                  >
                    <FileText size={20} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={`/history/${role}`}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-white rounded-md my-1",
                      isActive('history') ? "bg-[#477FC0]" : "hover:bg-[#033B77]"
                    )}
                  >
                    <Clock size={20} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">History</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={`/users/${role}`}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-white rounded-md my-1",
                      isActive('users') ? "bg-[#477FC0]" : "hover:bg-[#033B77]"
                    )}
                  >
                    <Users size={20} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Users</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={`/settings/${role}`}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-white rounded-md my-1",
                      isActive('settings') ? "bg-[#477FC0]" : "hover:bg-[#033B77]"
                    )}
                  >
                    <Settings size={20} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>
      
      <div className="mt-auto border-t border-[#477FC0]">
        {expanded ? (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 h-12 text-white hover:bg-[#033B77] transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full h-12 text-white hover:bg-[#033B77] transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default Sidebar;