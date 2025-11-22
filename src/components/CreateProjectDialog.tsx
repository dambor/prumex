import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, X, Mail, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface ProjectMember {
  email: string;
  name: string;
  role: 'Proprietário' | 'Contratante';
}

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (name: string, description: string, members: ProjectMember[]) => Promise<void>;
  currentUserEmail: string;
  currentUserName: string;
  currentUserRole: 'Proprietário' | 'Contratante';
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
  currentUserEmail,
  currentUserName,
  currentUserRole,
}: CreateProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Proprietário' | 'Contratante'>('Contratante');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddMember = () => {
    if (!newMemberEmail.trim() || !newMemberName.trim()) {
      toast.error('Preencha o email e nome do membro');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error('Email inválido');
      return;
    }

    // Verificar se já existe
    if (members.some(m => m.email === newMemberEmail)) {
      toast.error('Este membro já foi adicionado');
      return;
    }

    // Não permitir adicionar o próprio usuário
    if (newMemberEmail === currentUserEmail) {
      toast.error('Você já será adicionado automaticamente');
      return;
    }

    setMembers([...members, {
      email: newMemberEmail,
      name: newMemberName,
      role: newMemberRole,
    }]);

    // Limpar campos
    setNewMemberEmail('');
    setNewMemberName('');
    setNewMemberRole('Contratante');
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    // Permitir criar projeto sem membros adicionais (só com o usuário atual)

    setIsCreating(true);
    try {
      // Incluir o usuário atual na lista de membros
      const allMembers = [
        {
          email: currentUserEmail,
          name: currentUserName,
          role: currentUserRole,
        },
        ...members,
      ];

      await onCreateProject(projectName, projectDescription, allMembers);
      
      // Resetar formulário
      setProjectName('');
      setProjectDescription('');
      setMembers([]);
      setNewMemberEmail('');
      setNewMemberName('');
      setNewMemberRole('Contratante');
      onOpenChange(false);
      
      toast.success('Projeto criado com sucesso!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
          <DialogDescription>
            Configure um novo projeto de construção e adicione os membros da equipe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Projeto */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nome do Projeto *</Label>
              <Input
                id="project-name"
                placeholder="Ex: Casa Nova, Reforma Apartamento..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Descrição</Label>
              <Input
                id="project-description"
                placeholder="Ex: Construção residencial no bairro X"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Adicionar Membros */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Membros do Projeto</h3>
              <p className="text-sm text-gray-500 mb-4">
                Adicione proprietários e contratantes que terão acesso a este projeto
              </p>
            </div>

            {/* Usuário atual (sempre incluído) */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <User className="size-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{currentUserName} (Você)</p>
                  <p className="text-xs text-gray-500 truncate">{currentUserEmail}</p>
                </div>
                <span className="text-xs font-medium text-blue-600 px-2 py-1 bg-blue-100 rounded">
                  {currentUserRole}
                </span>
              </div>
            </div>

            {/* Membros adicionados */}
            {members.map((member) => (
              <div key={member.email} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="size-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-100 rounded">
                    {member.role}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.email)}
                    className="size-8 p-0"
                  >
                    <X className="size-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Formulário para adicionar novo membro */}
            <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Adicionar Membro</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="member-name" className="text-xs">Nome *</Label>
                  <Input
                    id="member-name"
                    placeholder="Nome completo"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="member-email" className="text-xs">Email *</Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="member-role" className="text-xs">Papel *</Label>
                  <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                    <SelectTrigger id="member-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proprietário">Proprietário</SelectItem>
                      <SelectItem value="Contratante">Contratante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleAddMember}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isCreating || !projectName.trim()}
              className="flex-1"
            >
              {isCreating ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}