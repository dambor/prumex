import { Building2, ChevronDown, Check, Home, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { UserMenu } from './UserMenu';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface TopBarProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (project: any) => void;
  onCreateProject: () => void;
  onProjectClick?: () => void;
  userName: string;
  userEmail: string;
  userRole: string;
  onProjectManagement: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export function TopBar({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onProjectClick,
  userName,
  userEmail,
  userRole,
  onProjectManagement,
  onSettings,
  onLogout
}: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-1.5 flex justify-between items-center z-50" style={{ paddingLeft: '56px', paddingRight: '1rem' }}>
      {/* Project Selector */}
      <div className="flex items-center gap-1.5">
        {/* Project Name - Clickable to go to dashboard */}
        <button 
          onClick={() => {
            if (onProjectClick && currentProject) {
              onProjectClick();
            }
          }}
          className="min-w-0 text-left hover:bg-gray-50 rounded-lg px-0 py-1 transition-all"
        >
          <p className="font-semibold text-gray-900 truncate text-xs text-[15px] cursor-pointer hover:text-blue-600 transition-colors">
            {currentProject?.name || 'Selecione um projeto'}
          </p>
        </button>
        
        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center hover:bg-gray-50 rounded-lg p-1 transition-all group">
              <ChevronDown className="size-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            <div className="px-2 py-1.5">
              <p className="text-xs text-gray-500 uppercase">Meus Projetos</p>
            </div>
            <DropdownMenuSeparator />
            
            {/* Lista de Projetos */}
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                className="cursor-pointer flex items-start gap-3 p-3"
                onClick={() => onSelectProject(project)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Home className="size-4 text-blue-600 flex-shrink-0" />
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {project.name}
                    </p>
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate ml-6">
                      {project.description}
                    </p>
                  )}
                </div>
                
                {currentProject?.id === project.id && (
                  <Check className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            {/* Novo Projeto */}
            <DropdownMenuItem
              className="cursor-pointer text-blue-600"
              onClick={onCreateProject}
            >
              <Plus className="size-4 mr-2" />
              Criar Novo Projeto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Menu */}
      <UserMenu
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        onCreateProject={onCreateProject}
        onProjectManagement={onProjectManagement}
        onSettings={onSettings}
        onLogout={onLogout}
      />
    </div>
  );
}