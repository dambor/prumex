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
  Smartphone, 
  FileText, 
  Copy, 
  CheckCircle,
  QrCode,
  Eye
} from 'lucide-react';
import type { Expense } from '../App';
import { toast } from 'sonner@2.0.3';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onPaymentComplete: (paymentMethod: string, receiptData: any) => void;
}

export function PaymentDialog({ 
  open, 
  onOpenChange, 
  expense,
  onPaymentComplete
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [processing, setProcessing] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [showPixQR, setShowPixQR] = useState(false);
  const [showBoleto, setShowBoleto] = useState(false);
  
  // Dados do cartão
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  if (!expense) return null;

  const copyPixKey = () => {
    if (expense.pixKey) {
      navigator.clipboard.writeText(expense.pixKey);
      toast.success('Chave PIX copiada!');
    }
  };

  const generatePixCode = () => {
    // Simulação de código PIX (em produção, viria do backend)
    const code = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substr(2, 32)}520400005303986540${expense.amount.toFixed(2)}5802BR5925CONSTRUTOR OBRAS LTDA6009SAO PAULO62070503***6304`;
    setPixCode(code);
    setShowPixQR(true);
  };

  const handleCardPayment = async () => {
    setProcessing(true);
    
    // Simulação de processamento de pagamento
    // Em produção, integraria com Stripe, PagSeguro, etc.
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete('Cartão de Crédito', {
        cardLastDigits: cardData.number.slice(-4),
        cardName: cardData.name
      });
      toast.success('Pagamento processado com sucesso!');
      onOpenChange(false);
    }, 2000);
  };

  const handlePixPayment = async () => {
    setProcessing(true);
    
    // Simulação de confirmação de pagamento PIX
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete('PIX', { pixCode });
      toast.success('Pagamento PIX confirmado!');
      onOpenChange(false);
    }, 2000);
  };

  const handleBoletoGeneration = async () => {
    setProcessing(true);
    
    // Simulação de geração de boleto
    setTimeout(() => {
      setProcessing(false);
      const boletoCode = `23793.38128 60000.000001 00000.000000 1 ${Date.now().toString().slice(-14)}`;
      onPaymentComplete('Boleto Bancário', { boletoCode });
      toast.success('Boleto gerado! Aguardando pagamento.');
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Efetuar Pagamento</DialogTitle>
          <DialogDescription>
            Escolha a forma de pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Descrição:</span>
            <span className="text-sm">{expense.description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Valor a pagar:</span>
            <span className="text-lg">R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Vencimento:</span>
            <span className="text-sm">{new Date(expense.dueDate).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pix">
              <Smartphone className="size-4 mr-2" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="card">
              <CreditCard className="size-4 mr-2" />
              Cartão
            </TabsTrigger>
            <TabsTrigger value="boleto">
              <FileText className="size-4 mr-2" />
              Boleto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="space-y-4">
            {expense.pixKey ? (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-green-900 mb-4 flex items-center gap-2">
                    <Smartphone className="size-5" />
                    Chave PIX para Pagamento
                  </h3>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <Label className="text-xs text-gray-600 mb-2 block">Chave PIX:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={expense.pixKey} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" onClick={copyPixKey}>
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      📱 <strong>Como pagar:</strong>
                    </p>
                    <ol className="text-sm text-blue-800 mt-2 ml-4 space-y-1 list-decimal">
                      <li>Abra o app do seu banco</li>
                      <li>Escolha PIX</li>
                      <li>Cole a chave PIX acima</li>
                      <li>Confirme o valor de R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                      <li>Finalize o pagamento</li>
                    </ol>
                  </div>
                </div>

                <Button 
                  onClick={handlePixPayment} 
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? 'Confirmando...' : 'Confirmar Pagamento Realizado'}
                </Button>
              </div>
            ) : !showPixQR ? (
              <div className="text-center py-8">
                <QrCode className="size-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Pagamento via PIX</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Gere o código PIX para realizar o pagamento
                </p>
                <Button onClick={generatePixCode} className="w-full">
                  Gerar Código PIX
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                  <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="size-32 text-gray-400" />
                  </div>
                  <p className="text-xs text-center text-gray-600 mb-4">
                    Escaneie o QR Code com o app do seu banco
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Ou copie o código PIX</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={pixCode} 
                      readOnly 
                      className="text-xs"
                    />
                    <Button variant="outline" onClick={() => {
                      navigator.clipboard.writeText(pixCode);
                      toast.success('Código PIX copiado!');
                    }}>
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handlePixPayment} 
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? 'Confirmando...' : 'Confirmar Pagamento'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  maxLength={19}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input
                  id="cardName"
                  placeholder="NOME SOBRENOME"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
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
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    maxLength={4}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCardPayment} 
                className="w-full"
                disabled={processing || !cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv}
              >
                {processing ? 'Processando...' : `Pagar R$ ${expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="boleto" className="space-y-4">
            {expense.boletoUrl ? (
              <div className="space-y-4">
                {!showBoleto ? (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-orange-900 mb-4 flex items-center gap-2">
                      <FileText className="size-5" />
                      Boleto Bancário
                    </h3>
                    
                    <div className="bg-white rounded-lg border-2 border-dashed border-orange-300 p-8 mb-4 text-center">
                      <FileText className="size-16 text-orange-600 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">Visualize o boleto anexado para efetuar o pagamento</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowBoleto(true)}
                        className="w-full"
                      >
                        <Eye className="size-4 mr-2" />
                        Visualizar Boleto
                      </Button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Importante:</strong> O pagamento pode levar até 2 dias úteis para ser confirmado
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        📄 <strong>Como pagar:</strong>
                      </p>
                      <ol className="text-sm text-blue-800 mt-2 ml-4 space-y-1 list-decimal">
                        <li>Visualize o boleto anexado</li>
                        <li>Pague no app do banco, lotérica ou banco</li>
                        <li>Aguarde a compensação (até 2 dias úteis)</li>
                        <li>Confirme o pagamento aqui após compensado</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-orange-200 rounded-lg overflow-hidden">
                      <div className="bg-orange-50 p-3 border-b border-orange-200 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-orange-900 flex items-center gap-2">
                          <FileText className="size-4" />
                          Visualização do Boleto
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBoleto(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                      <div className="bg-white">
                        <iframe
                          src={expense.boletoUrl}
                          className="w-full h-[400px]"
                          title="Visualização do Boleto"
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Importante:</strong> O pagamento pode levar até 2 dias úteis para ser confirmado
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleBoletoGeneration} 
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? 'Confirmando...' : 'Confirmar Pagamento Realizado'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="size-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Boleto Bancário</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Gere o boleto para pagamento em banco ou lotérica
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    ⚠️ O pagamento pode levar até 2 dias úteis para ser confirmado
                  </p>
                </div>
                <Button 
                  onClick={handleBoletoGeneration} 
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? 'Gerando...' : 'Gerar Boleto'}
                </Button>
              </div>
            )}
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