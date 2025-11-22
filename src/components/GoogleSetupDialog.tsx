import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';

interface GoogleSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoogleSetupDialog({ open, onOpenChange }: GoogleSetupDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const callbackUrl = `https://${projectId}.supabase.co/auth/v1/callback`;
  
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copiado!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-6 text-yellow-600" />
            <DialogTitle>Configurar Login com Google</DialogTitle>
          </div>
          <DialogDescription>
            O Google OAuth ainda não foi configurado. Siga os passos abaixo para habilitar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Passo 1 */}
          <div className="space-y-3 border-l-4 border-blue-600 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded-full bg-blue-600 text-white text-sm">1</div>
              <h3 className="font-semibold">Criar Projeto no Google Cloud</h3>
            </div>
            <p className="text-sm text-gray-600">
              Acesse o Google Cloud Console e crie as credenciais OAuth 2.0
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
            >
              <ExternalLink className="size-4 mr-2" />
              Abrir Google Cloud Console
            </Button>
          </div>

          {/* Passo 2 */}
          <div className="space-y-3 border-l-4 border-purple-600 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded-full bg-purple-600 text-white text-sm">2</div>
              <h3 className="font-semibold">Configurar Credenciais OAuth</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Clique em <strong>+ Criar Credenciais</strong> → <strong>ID do cliente OAuth 2.0</strong></li>
              <li>Tipo de aplicativo: <strong>Aplicativo da Web</strong></li>
              <li>Nome: <strong>Gestão de Obras - Auth</strong></li>
            </ul>
          </div>

          {/* Passo 3 - URL de Callback */}
          <div className="space-y-3 border-l-4 border-green-600 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded-full bg-green-600 text-white text-sm">3</div>
              <h3 className="font-semibold">Adicionar URL de Redirecionamento</h3>
            </div>
            <p className="text-sm text-gray-600">
              Em <strong>URIs de redirecionamento autorizados</strong>, adicione esta URL:
            </p>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md border">
              <code className="flex-1 text-sm break-all">{callbackUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(callbackUrl, 'URL de Callback')}
              >
                {copiedField === 'URL de Callback' ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="space-y-3 border-l-4 border-orange-600 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded-full bg-orange-600 text-white text-sm">4</div>
              <h3 className="font-semibold">Copiar Credenciais</h3>
            </div>
            <p className="text-sm text-gray-600">
              Após criar, copie o <strong>Client ID</strong> e <strong>Client Secret</strong> que aparecerem.
            </p>
          </div>

          {/* Passo 5 - Configurar Supabase */}
          <div className="space-y-3 border-l-4 border-red-600 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded-full bg-red-600 text-white text-sm">5</div>
              <h3 className="font-semibold">Configurar no Supabase</h3>
            </div>
            <p className="text-sm text-gray-600">
              Cole as credenciais no Supabase Dashboard
            </p>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-md border">
                <p className="text-sm mb-2"><strong>Seu Project ID:</strong></p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm">{projectId}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(projectId, 'Project ID')}
                  >
                    {copiedField === 'Project ID' ? (
                      <Check className="size-4 text-green-600" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/auth/providers`, '_blank')}
              >
                <ExternalLink className="size-4 mr-2" />
                Abrir Configurações de Auth no Supabase
              </Button>
            </div>
            
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside mt-2">
              <li>Vá em <strong>Authentication</strong> → <strong>Providers</strong></li>
              <li>Encontre <strong>Google</strong> e clique para expandir</li>
              <li><strong>Habilite</strong> o provider (toggle ON)</li>
              <li>Cole o <strong>Client ID</strong> do Google</li>
              <li>Cole o <strong>Client Secret</strong> do Google</li>
              <li>Clique em <strong>Save</strong></li>
            </ul>
          </div>

          {/* Passo 6 */}
          <div className="space-y-3 border-l-4 border-pink-600 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded-full bg-pink-600 text-white text-sm">6</div>
              <h3 className="font-semibold">Testar Login</h3>
            </div>
            <p className="text-sm text-gray-600">
              Feche este diálogo e clique novamente em <strong>"Continuar com Google"</strong>. 
              O login deve funcionar! 🎉
            </p>
          </div>

          {/* Documentação */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              📚 <strong>Documentação oficial:</strong>
            </p>
            <Button 
              variant="link" 
              className="text-blue-600 p-0 h-auto"
              onClick={() => window.open('https://supabase.com/docs/guides/auth/social-login/auth-google', '_blank')}
            >
              https://supabase.com/docs/guides/auth/social-login/auth-google
              <ExternalLink className="size-3 ml-1" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
