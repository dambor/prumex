import { useState, useEffect } from 'react';
import { X, Plus, Trash2, UserPlus, Building2, Users, Edit2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import * as api from '../utils/api';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: Array<{
    email: string;
    name: string;
    role: 'Proprietário' | 'Contratante';
  }>;
}

interface ProjectManagementProps {
  onClose: () => void;
  currentUser: {
    email: string;
    name: string;
    role: 'Proprietário' | 'Contratante';
  };
  onProjectsChanged: () => void;
}

export function ProjectManagement({ onClose, currentUser, onProjectsChanged }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  
  // Editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Form states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Proprietário' | 'Contratante'>('Contratante');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await api.fetchProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    try {
      await api.createProject({
        name: newProjectName,
        description: newProjectDescription,
        members: [
          {
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role
          }
        ]
      });

      toast.success('Projeto criado com sucesso!');
      setNewProjectName('');
      setNewProjectDescription('');
      setShowNewProjectForm(false);
      await loadProjects();
      onProjectsChanged();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o projeto "${projectName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await api.deleteProject(projectId);
      toast.success('Projeto deletado com sucesso!');
      await loadProjects();
      onProjectsChanged();
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao deletar projeto');
    }
  };

  const handleAddMember = async () => {
    if (!selectedProject) return;

    if (!newMemberEmail.trim() || !newMemberName.trim()) {
      toast.error('Email e nome são obrigatórios');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error('Email inválido');
      return;
    }

    try {
      await api.addProjectMember(selectedProject.id, {
        email: newMemberEmail,
        name: newMemberName,
        role: newMemberRole
      });

      toast.success('Membro adicionado com sucesso!');
      setNewMemberEmail('');
      setNewMemberName('');
      setNewMemberRole('Contratante');
      setShowAddMemberForm(false);
      await loadProjects();
      
      // Atualizar projeto selecionado
      const updatedProjects = await api.fetchProjects();
      const updated = updatedProjects.find(p => p.id === selectedProject.id);
      if (updated) {
        setSelectedProject(updated);
      }
      onProjectsChanged();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Erro ao adicionar membro');
    }
  };

  const handleRemoveMember = async (projectId: string, memberEmail: string, memberName: string) => {
    if (!confirm(`Remover ${memberName} do projeto?`)) {
      return;
    }

    try {
      await api.removeProjectMember(projectId, memberEmail);
      toast.success('Membro removido com sucesso!');
      await loadProjects();
      
      // Atualizar projeto selecionado
      const updatedProjects = await api.fetchProjects();
      const updated = updatedProjects.find(p => p.id === projectId);
      if (updated) {
        setSelectedProject(updated);
      }
      onProjectsChanged();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    }
  };

  const handleEditName = () => {
    if (!selectedProject) return;
    setIsEditingName(true);
    setEditName(selectedProject.name);
  };

  const handleEditDescription = () => {
    if (!selectedProject) return;
    setIsEditingDescription(true);
    setEditDescription(selectedProject.description);
  };

  const handleSaveName = async () => {
    if (!selectedProject) return;
    if (!editName.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    try {
      await api.updateProject(selectedProject.id, {
        name: editName
      });

      toast.success('Nome do projeto atualizado com sucesso!');
      setIsEditingName(false);
      await loadProjects();
      
      // Atualizar projeto selecionado
      const updatedProjects = await api.fetchProjects();
      const updated = updatedProjects.find(p => p.id === selectedProject.id);
      if (updated) {
        setSelectedProject(updated);
      }
      onProjectsChanged();
    } catch (error) {
      console.error('Error updating project name:', error);
      toast.error('Erro ao atualizar nome do projeto');
    }
  };

  const handleSaveDescription = async () => {
    if (!selectedProject) return;
    if (!editDescription.trim()) {
      toast.error('Descrição do projeto é obrigatória');
      return;
    }

    try {
      await api.updateProject(selectedProject.id, {
        description: editDescription
      });

      toast.success('Descrição do projeto atualizada com sucesso!');
      setIsEditingDescription(false);
      await loadProjects();
      
      // Atualizar projeto selecionado
      const updatedProjects = await api.fetchProjects();
      const updated = updatedProjects.find(p => p.id === selectedProject.id);
      if (updated) {
        setSelectedProject(updated);
      }
      onProjectsChanged();
    } catch (error) {
      console.error('Error updating project description:', error);
      toast.error('Erro ao atualizar descrição do projeto');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Gerenciar Projetos
            </CardTitle>
            <CardDescription>
              Crie, edite e gerencie seus projetos de construção
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando projetos...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Coluna Esquerda - Lista de Projetos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Meus Projetos ({projects.length})</h3>
                  <Button
                    size="sm"
                    onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                    variant={showNewProjectForm ? "outline" : "default"}
                  >
                    <Plus className="size-4 mr-2" />
                    Novo Projeto
                  </Button>
                </div>

                {/* Formulário de Novo Projeto */}
                {showNewProjectForm && (
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="text-base">Criar Novo Projeto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="projectName">Nome do Projeto *</Label>
                        <Input
                          id="projectName"
                          placeholder="Ex: Casa da Praia"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectDescription">Descrição</Label>
                        <Input
                          id="projectDescription"
                          placeholder="Ex: Construção de casa de veraneio"
                          value={newProjectDescription}
                          onChange={(e) => setNewProjectDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateProject} className="flex-1">
                          Criar Projeto
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowNewProjectForm(false);
                            setNewProjectName('');
                            setNewProjectDescription('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de Projetos */}
                <div className="space-y-2">
                  {projects.map((project) => (
                    <Card 
                      key={project.id}
                      className={`cursor-pointer transition-colors hover:border-primary ${
                        selectedProject?.id === project.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{project.name}</h4>
                            {project.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Users className="size-3" />
                              {project.members.length} {project.members.length === 1 ? 'membro' : 'membros'}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {projects.length === 0 && !showNewProjectForm && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="size-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum projeto encontrado</p>
                      <p className="text-sm">Clique em "Novo Projeto" para começar</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna Direita - Detalhes do Projeto */}
              <div>
                {selectedProject ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Detalhes do Projeto</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Nome</Label>
                          {isEditingName ? (
                            <div className="flex items-center">
                              <Input
                                id="editName"
                                placeholder="Nome do projeto"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSaveName}
                                className="ml-2"
                              >
                                <Check className="size-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <p className="font-medium">{selectedProject.name}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEditName}
                                className="ml-2"
                              >
                                <Edit2 className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {selectedProject.description && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Descrição</Label>
                            {isEditingDescription ? (
                              <div className="flex items-center">
                                <Input
                                  id="editDescription"
                                  placeholder="Descrição do projeto"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="w-full"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleSaveDescription}
                                  className="ml-2"
                                >
                                  <Check className="size-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p>{selectedProject.description}</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleEditDescription}
                                  className="ml-2"
                                >
                                  <Edit2 className="size-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <Label className="text-xs text-muted-foreground">Criado em</Label>
                          <p>{new Date(selectedProject.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Membros do Projeto */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Membros ({selectedProject.members.length})
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                          >
                            <UserPlus className="size-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Formulário de Adicionar Membro */}
                        {showAddMemberForm && (
                          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                            <h4 className="font-medium text-sm">Adicionar Membro</h4>
                            <div className="space-y-2">
                              <div>
                                <Label htmlFor="memberEmail" className="text-xs">Email *</Label>
                                <Input
                                  id="memberEmail"
                                  type="email"
                                  placeholder="email@exemplo.com"
                                  value={newMemberEmail}
                                  onChange={(e) => setNewMemberEmail(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="memberName" className="text-xs">Nome *</Label>
                                <Input
                                  id="memberName"
                                  placeholder="Nome do membro"
                                  value={newMemberName}
                                  onChange={(e) => setNewMemberName(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="memberRole" className="text-xs">Função *</Label>
                                <select
                                  id="memberRole"
                                  className="w-full px-3 py-2 border rounded-md"
                                  value={newMemberRole}
                                  onChange={(e) => setNewMemberRole(e.target.value as 'Proprietário' | 'Contratante')}
                                >
                                  <option value="Contratante">Contratante</option>
                                  <option value="Proprietário">Proprietário</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleAddMember} className="flex-1">
                                Adicionar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowAddMemberForm(false);
                                  setNewMemberEmail('');
                                  setNewMemberName('');
                                  setNewMemberRole('Contratante');
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Lista de Membros */}
                        <div className="space-y-2">
                          {selectedProject.members.map((member) => (
                            <div
                              key={member.email}
                              className="flex items-start justify-between p-3 border rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{member.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                                  {member.role}
                                </span>
                              </div>
                              {selectedProject.members.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(selectedProject.id, member.email, member.name)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground p-8">
                    <div>
                      <Building2 className="size-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione um projeto para ver os detalhes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}