import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Building2, User, Mail, Lock, UserCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, name: string, role: 'Proprietário' | 'Contratante') => Promise<void>;
  onGoogleLogin: () => Promise<void>;
}

export function AuthDialog({ open, onOpenChange, onLogin, onSignup, onGoogleLogin }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<'Proprietário' | 'Contratante'>('Proprietário');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(loginEmail, loginPassword);
      onOpenChange(false);
      // Reset form
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSignup(signupEmail, signupPassword, signupName, signupRole);
      // Reset form
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      setSignupRole('Proprietário');
      // Switch to login tab after successful signup
      toast.success('Conta criada! Agora faça login.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await onGoogleLogin();
    } catch (error) {
      // Erro já tratado no App.tsx, não fazer nada aqui
      console.error('Google login error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Entrar ou Criar Conta</DialogTitle>
          <DialogDescription>
            Acesse sua conta ou crie uma nova para gerenciar sua obra.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 bg-[rgb(240,177,0)]"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline"
                className="w-full"
                disabled={isGoogleLoading}
                onClick={handleGoogleLogin}
              >
                {isGoogleLoading ? (
                  'Conectando...'
                ) : (
                  <>
                    <svg className="mr-2 size-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continuar com Google
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-10"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role">Tipo de Conta</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 size-4 text-gray-400 pointer-events-none" />
                  <select
                    id="signup-role"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as 'Proprietário' | 'Contratante')}
                  >
                    <option value="Proprietário">Proprietário</option>
                    <option value="Contratante">Contratante</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  {signupRole === 'Proprietário' 
                    ? 'Você é o dono da obra e vai gerenciar os pagamentos'
                    : 'Você é o contratante/construtor e vai adicionar despesas'
                  }
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 bg-[rgb(240,177,0)]"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}