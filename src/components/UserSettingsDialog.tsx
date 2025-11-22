import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Lock, Settings as SettingsIcon, Bell } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../utils/api';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'Proprietário' | 'Contratante';
  };
  onUserUpdate?: (updatedUser: any) => void;
}

export function UserSettingsDialog({ open, onOpenChange, user, onUserUpdate }: UserSettingsDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [userName, setUserName] = useState(user.name);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Preferências (exemplo)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Preencha todos os campos');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      if (newPassword.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      setIsChangingPassword(true);

      await api.changePassword(currentPassword, newPassword);

      toast.success('✅ Senha alterada com sucesso!');
      
      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!userName.trim()) {
        toast.error('O nome não pode estar vazio');
        return;
      }

      setIsUpdatingProfile(true);

      await api.updateUserProfile({ name: userName });

      toast.success('✅ Perfil atualizado com sucesso!');
      
      // Notificar componente pai
      if (onUserUpdate) {
        onUserUpdate({ ...user, name: userName });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            Configurações do Usuário
          </DialogTitle>
          <DialogDescription>
            Gerencie suas configurações de perfil, segurança e preferências.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="size-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="size-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Bell className="size-4 mr-2" />
              Preferências
            </TabsTrigger>
          </TabsList>

          {/* TAB: Perfil */}
          <TabsContent value="profile" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Função</p>
                  <Badge variant={user.role === 'Proprietário' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant="default" className="bg-green-500">Ativo</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">O email não pode ser alterado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">ID do Usuário</Label>
                <Input
                  id="userId"
                  type="text"
                  value={user.id}
                  disabled
                  className="bg-gray-100 cursor-not-allowed font-mono text-xs"
                />
              </div>

              <Button 
                onClick={handleUpdateProfile} 
                disabled={isUpdatingProfile || userName === user.name}
                className="w-full"
              >
                {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </TabsContent>

          {/* TAB: Segurança */}
          <TabsContent value="security" className="space-y-4 mt-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                <Lock className="size-4 inline mr-2" />
                Use uma senha forte com pelo menos 6 caracteres
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a nova senha novamente"
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600">As senhas não coincidem</p>
                )}
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-red-600">A senha deve ter pelo menos 6 caracteres</p>
                )}
              </div>

              <Button 
                onClick={handleChangePassword}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="font-medium mb-2">Sessões Ativas</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Navegador atual</p>
                    <p className="text-sm text-gray-600">Último acesso: agora</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Ativa</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: Preferências */}
          <TabsContent value="preferences" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-4">Notificações</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Notificações por Email</p>
                      <p className="text-sm text-gray-600">Receba atualizações sobre despesas e pagamentos</p>
                    </div>
                    <Switch 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Notificações Push</p>
                      <p className="text-sm text-gray-600">Alertas em tempo real no navegador</p>
                    </div>
                    <Switch 
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Aparência</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Tema</p>
                      <p className="text-sm text-gray-600">Claro (padrão)</p>
                    </div>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Dados e Privacidade</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Exportar Meus Dados
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    Excluir Minha Conta
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}