import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CreditCard, 
  Building2,
  Plus,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ConnectPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (method: any) => void;
}

export function ConnectPaymentMethodDialog({ 
  open, 
  onOpenChange,
  onConnect
}: ConnectPaymentMethodDialogProps) {
  const [tab, setTab] = useState<'card' | 'bank'>('card');
  const [connecting, setConnecting] = useState(false);
  
  // Dados do cartão
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Dados bancários
  const [bankData, setBankData] = useState({
    bankName: '',
    accountType: 'Corrente',
    accountNumber: '',
    agencyNumber: '',
    cpfCnpj: '',
    accountHolderName: ''
  });

  const handleConnectCard = async () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      toast.error('Preencha todos os campos do cartão');
      return;
    }

    setConnecting(true);

    try {
      // Simulação de tokenização do cartão
      // Em produção, usaria Stripe.js para tokenizar de forma segura
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentMethod = {
        id: `card_${Date.now()}`,
        type: 'card',
        card: {
          brand: detectCardBrand(cardData.number),
          last4: cardData.number.slice(-4),
          expMonth: cardData.expiry.split('/')[0],
          expYear: cardData.expiry.split('/')[1],
          holderName: cardData.name
        },
        isDefault: false
      };

      onConnect(paymentMethod);
      
      toast.success('Cartão conectado com sucesso!');
      
      // Reset form
      setCardData({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error connecting card:', error);
      toast.error('Erro ao conectar cartão. Tente novamente.');
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectBank = async () => {
    if (!bankData.bankName || !bankData.accountNumber || !bankData.agencyNumber || 
        !bankData.cpfCnpj || !bankData.accountHolderName) {
      toast.error('Preencha todos os campos bancários');
      return;
    }

    setConnecting(true);

    try {
      // Simulação de validação bancária
      // Em produção, integraria com Open Finance ou API do banco
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentMethod = {
        id: `bank_${Date.now()}`,
        type: 'bank',
        bank: {
          name: bankData.bankName,
          accountType: bankData.accountType,
          last4: bankData.accountNumber.slice(-4),
          holderName: bankData.accountHolderName
        },
        isDefault: false
      };

      onConnect(paymentMethod);
      
      toast.success('Conta bancária conectada com sucesso!');
      
      // Reset form
      setBankData({
        bankName: '',
        accountType: 'Corrente',
        accountNumber: '',
        agencyNumber: '',
        cpfCnpj: '',
        accountHolderName: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error connecting bank:', error);
      toast.error('Erro ao conectar conta bancária. Tente novamente.');
    } finally {
      setConnecting(false);
    }
  };

  const detectCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    if (/^(?:2131|1800|35)/.test(cleaned)) return 'JCB';
    if (/^(5018|5020|5038|6304|6759|6761|6763)/.test(cleaned)) return 'Maestro';
    return 'Outro';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Conectar Método de Pagamento</DialogTitle>
          <DialogDescription>
            Conecte seu cartão ou conta bancária para pagamentos mais rápidos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card">
              <CreditCard className="size-4 mr-2" />
              Cartão de Crédito
            </TabsTrigger>
            <TabsTrigger value="bank">
              <Building2 className="size-4 mr-2" />
              Conta Bancária
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex gap-2">
                <CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 font-medium">Conexão Segura</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Seus dados são criptografados e protegidos. Não armazenamos informações sensíveis.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(e) => setCardData({ 
                    ...cardData, 
                    number: formatCardNumber(e.target.value)
                  })}
                  maxLength={19}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input
                  id="cardName"
                  placeholder="NOME COMO ESTÁ NO CARTÃO"
                  value={cardData.name}
                  onChange={(e) => setCardData({ 
                    ...cardData, 
                    name: e.target.value.toUpperCase() 
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ 
                      ...cardData, 
                      expiry: formatExpiry(e.target.value)
                    })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ 
                      ...cardData, 
                      cvv: e.target.value.replace(/\D/g, '')
                    })}
                    maxLength={4}
                  />
                </div>
              </div>

              <Button 
                onClick={handleConnectCard} 
                className="w-full"
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    Conectar Cartão
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex gap-2">
                <CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 font-medium">Conexão Segura via Open Finance</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Conecte sua conta bancária de forma segura e autorizada pelo Banco Central.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banco</Label>
                <select
                  id="bankName"
                  value={bankData.bankName}
                  onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione seu banco</option>
                  <option value="Banco do Brasil">Banco do Brasil</option>
                  <option value="Bradesco">Bradesco</option>
                  <option value="Caixa Econômica">Caixa Econômica Federal</option>
                  <option value="Itaú">Itaú</option>
                  <option value="Santander">Santander</option>
                  <option value="Nubank">Nubank</option>
                  <option value="Inter">Inter</option>
                  <option value="C6 Bank">C6 Bank</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo de Conta</Label>
                <select
                  id="accountType"
                  value={bankData.accountType}
                  onChange={(e) => setBankData({ ...bankData, accountType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Corrente">Conta Corrente</option>
                  <option value="Poupança">Conta Poupança</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyNumber">Agência</Label>
                  <Input
                    id="agencyNumber"
                    placeholder="0000"
                    value={bankData.agencyNumber}
                    onChange={(e) => setBankData({ 
                      ...bankData, 
                      agencyNumber: e.target.value.replace(/\D/g, '')
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Conta</Label>
                  <Input
                    id="accountNumber"
                    placeholder="00000-0"
                    value={bankData.accountNumber}
                    onChange={(e) => setBankData({ 
                      ...bankData, 
                      accountNumber: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Titular da Conta</Label>
                <Input
                  id="accountHolderName"
                  placeholder="Nome completo do titular"
                  value={bankData.accountHolderName}
                  onChange={(e) => setBankData({ 
                    ...bankData, 
                    accountHolderName: e.target.value.toUpperCase()
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">CPF/CNPJ do Titular</Label>
                <Input
                  id="cpfCnpj"
                  placeholder="000.000.000-00"
                  value={bankData.cpfCnpj}
                  onChange={(e) => setBankData({ 
                    ...bankData, 
                    cpfCnpj: e.target.value
                  })}
                />
              </div>

              <Button 
                onClick={handleConnectBank} 
                className="w-full"
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    Conectar Conta Bancária
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
