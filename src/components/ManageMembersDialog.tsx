import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, X, User, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ProjectMember } from './CreateProjectDialog';

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  members: ProjectMember[];
  currentUserEmail: string;
  onAddMember: (projectId: string, member: ProjectMember) => Promise<void>;
  onRemoveMember: (projectId: string, memberEmail: string) => Promise<void>;
}

export function ManageMembersDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  members,
  currentUserEmail,
  onAddMember,
  onRemoveMember,
}: ManageMembersDialogProps) {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Proprietário' | 'Contratante'>('Contratante');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMember = async () => {
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
      toast.error('Este membro já faz parte do projeto');
      return;
    }

    setIsAdding(true);
    try {
      await onAddMember(projectId, {
        email: newMemberEmail,
        name: newMemberName,
        role: newMemberRole,
      });

      // Limpar campos
      setNewMemberEmail('');
      setNewMemberName('');
      setNewMemberRole('Contratante');
      
      toast.success('Membro adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Erro ao adicionar membro');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberEmail: string) => {
    if (memberEmail === currentUserEmail) {
      toast.error('Você não pode remover a si mesmo do projeto');
      return;
    }

    if (members.length <= 1) {
      toast.error('O projeto deve ter pelo menos um membro');
      return;
    }

    try {
      await onRemoveMember(projectId, memberEmail);
      toast.success('Membro removido com sucesso!');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros</DialogTitle>
          <DialogDescription>
            Adicione ou remova membros do projeto "{projectName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Lista de Membros Atuais */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Membros Atuais ({members.length})</h3>
            
            <div className="space-y-2">
              {members.map((member) => (
                <div 
                  key={member.email} 
                  className={`p-3 border rounded-lg ${
                    member.email === currentUserEmail 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      member.email === currentUserEmail 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300'
                    }`}>
                      <User className={`size-5 ${
                        member.email === currentUserEmail 
                          ? 'text-white' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {member.name}
                          {member.email === currentUserEmail && (
                            <span className="ml-2 text-xs text-blue-600">(Você)</span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        member.email === currentUserEmail
                          ? 'text-blue-600 bg-blue-100'
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {member.role}
                      </span>
                      
                      {member.email !== currentUserEmail && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.email)}
                          className="size-8 p-0 hover:bg-red-50"
                        >
                          <X className="size-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar Novo Membro */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Adicionar Novo Membro</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-member-name">Nome Completo *</Label>
                  <Input
                    id="new-member-name"
                    placeholder="Digite o nome"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-member-email">Email *</Label>
                  <Input
                    id="new-member-email"
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
                  <Label htmlFor="new-member-role">Papel no Projeto *</Label>
                  <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                    <SelectTrigger id="new-member-role">
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
                    onClick={handleAddMember}
                    disabled={isAdding || !newMemberEmail.trim() || !newMemberName.trim()}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    {isAdding ? 'Adicionando...' : 'Adicionar Membro'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Fechar */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
