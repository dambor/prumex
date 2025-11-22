import { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Plus, Building2, Trash2, LayoutDashboard, DollarSign, User, LogOut, Settings, Users, ChevronDown, Check, UserCog, FileText, Receipt, File, Image } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { CreateProjectDialog, ProjectMember } from './CreateProjectDialog';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members?: ProjectMember[];
}

type TabValue = 'overview' | 'progress' | 'budget' | 'employees' | 'quotations' | 'expenses' | 'documents' | 'photos';

interface ProjectSidebarProps {
  projects: Array<{
    id: string;
    name: string;
    role?: 'owner' | 'contractor';
    description?: string;
  }>;
  currentProject: {
    id: string;
    name: string;
    role?: 'owner' | 'contractor';
  } | null;
  currentTab?: TabValue;
  onSelectProject: (project: any) => void;
  onSelectTab?: (tab: TabValue) => void;
  onCreateProject: (name: string, description: string, members: any[]) => void;
  onDeleteProject?: (projectId: string) => void;
  onAddMember?: (projectId: string, member: any) => void;
  onRemoveMember?: (projectId: string, memberEmail: string) => void;
  onProjectManagementOpen: () => void;
  onSettingsOpen?: () => void;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export function ProjectSidebar({
  projects,
  currentProject,
  currentTab = 'overview',
  onSelectProject,
  onSelectTab,
  onCreateProject,
  onDeleteProject,
  onAddMember,
  onRemoveMember,
  onProjectManagementOpen,
  onSettingsOpen,
  onLogout,
  userName,
  userEmail,
  userRole
}: ProjectSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectMembers, setNewProjectMembers] = useState<ProjectMember[]>([]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    await onCreateProject(newProjectName, newProjectDescription, newProjectMembers);
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectMembers([]);
    setIsDialogOpen(false);
    toast.success('Projeto criado com sucesso!');
  };

  const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (projects.length === 1) {
      toast.error('Não é possível excluir o último projeto');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o projeto "${project.name}"? Todas as despesas e orçamentos serão perdidos.`)) {
      onDeleteProject(project.id);
      toast.success('Projeto excluído com sucesso');
    }
  };

  return (
    <>
      {/* Narrow Icon Sidebar */}
      {/* MUDANÇA: top-11 (44px) e altura ajustada para 100vh - 2.75rem 
          Isso sobe a barra 4px em relação à anterior.
      */}
      <div className="fixed left-0 top-11 h-[calc(100vh-2.75rem)] w-14 bg-white border-r border-gray-200 shadow-lg z-40">
        {/* Navigation */}
        <nav className="flex flex-col items-center gap-1 h-full overflow-y-auto px-2 pb-[8px] pt-[5px] pr-[8px] pl-[8px]">
          {/* Navigation Tabs - only show if project is selected */}
          {currentProject && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTab('expenses')}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all ${
                      currentTab === 'expenses'
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Receipt className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Despesas
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTab('budget')}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all ${
                      currentTab === 'budget'
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <DollarSign className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Orçamento
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTab('employees')}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all ${
                      currentTab === 'employees'
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <UserCog className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Pessoal
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTab('quotations')}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all ${
                      currentTab === 'quotations'
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Cotações
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTab('documents')}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all ${
                      currentTab === 'documents'
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <File className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Documentos
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTab('photos')}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all ${
                      currentTab === 'photos'
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Image className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Fotos
                </TooltipContent>
              </Tooltip>
            </>
          )}
          
          {/* Empty state when no project is selected */}
          {!currentProject && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11"
                >
                  <Plus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Criar Novo Projeto
              </TooltipContent>
            </Tooltip>
          )}
        </nav>
      </div>

      {/* Spacer to prevent content from going under sidebar */}
      <div className="w-14" />

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateProject={onCreateProject}
        currentUserEmail={userEmail || ''}
        currentUserName={userName || ''}
        currentUserRole={userRole as 'Proprietário' | 'Contratante' || 'Proprietário'}
      />
    </>
  );
}