import { User, Plus, Building2, Settings, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';

interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onCreateProject?: () => void;
  onProjectManagement?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function UserMenu({
  userName,
  userEmail,
  userRole,
  onCreateProject,
  onProjectManagement,
  onSettings,
  onLogout
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center transition-all">
          <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 hover:bg-blue-200">
            <User className="size-4 text-blue-600" />
          </div>
          {userName && (
            <div className="text-left">
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        {/* User Info */}
        {userName && userEmail && userRole && (
          <>
            <div className="px-3 py-3 text-center">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
              <p className="text-xs text-blue-600 mt-1 font-medium">{userRole}</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* New Project */}
        {onCreateProject && (
          <DropdownMenuItem className="cursor-pointer" onClick={onCreateProject}>
            <Plus className="size-4 mr-2" />
            Novo Projeto
          </DropdownMenuItem>
        )}
        
        {/* Manage Projects */}
        {onProjectManagement && (
          <DropdownMenuItem className="cursor-pointer" onClick={onProjectManagement}>
            <Building2 className="size-4 mr-2" />
            Gerenciar Projetos
          </DropdownMenuItem>
        )}
        
        {/* Settings */}
        {onSettings && (
          <DropdownMenuItem className="cursor-pointer" onClick={onSettings}>
            <Settings className="size-4 mr-2" />
            Configurações
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        {onLogout && (
          <DropdownMenuItem className="cursor-pointer text-red-600" onClick={onLogout}>
            <LogOut className="size-4 mr-2" />
            Sair
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}