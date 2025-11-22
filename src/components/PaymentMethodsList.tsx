import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  CreditCard, 
  Building2,
  Trash2,
  Star,
  StarOff
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  card?: {
    brand: string;
    last4: string;
    expMonth: string;
    expYear: string;
    holderName: string;
  };
  bank?: {
    name: string;
    accountType: string;
    last4: string;
    holderName: string;
  };
  isDefault: boolean;
}

interface PaymentMethodsListProps {
  methods: PaymentMethod[];
  onSetDefault: (methodId: string) => void;
  onDelete: (methodId: string) => void;
}

export function PaymentMethodsList({ 
  methods, 
  onSetDefault, 
  onDelete 
}: PaymentMethodsListProps) {
  const getCardBrandLogo = (brand: string) => {
    const logos: Record<string, string> = {
      'Visa': '💳',
      'Mastercard': '💳',
      'Amex': '💳',
      'Discover': '💳',
      'JCB': '💳',
      'Maestro': '💳',
      'Outro': '💳'
    };
    return logos[brand] || '💳';
  };

  const getBankLogo = (bankName: string) => {
    const logos: Record<string, string> = {
      'Banco do Brasil': '🏦',
      'Bradesco': '🏦',
      'Caixa Econômica': '🏦',
      'Itaú': '🏦',
      'Santander': '🏦',
      'Nubank': '💜',
      'Inter': '🧡',
      'C6 Bank': '⚫',
    };
    return logos[bankName] || '🏦';
  };

  if (methods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CreditCard className="size-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">Nenhum método de pagamento conectado</p>
        <p className="text-xs mt-1">Conecte um cartão ou conta bancária para pagamentos mais rápidos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <Card key={method.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {method.type === 'card' ? (
                <div className="bg-blue-100 rounded-lg p-2">
                  <CreditCard className="size-5 text-blue-600" />
                </div>
              ) : (
                <div className="bg-green-100 rounded-lg p-2">
                  <Building2 className="size-5 text-green-600" />
                </div>
              )}
              
              <div className="flex-1">
                {method.type === 'card' && method.card && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCardBrandLogo(method.card.brand)}</span>
                      <span className="font-medium">{method.card.brand}</span>
                      <span className="text-gray-500">•••• {method.card.last4}</span>
                      {method.isDefault && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {method.card.holderName} • Exp: {method.card.expMonth}/{method.card.expYear}
                    </p>
                  </div>
                )}
                
                {method.type === 'bank' && method.bank && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getBankLogo(method.bank.name)}</span>
                      <span className="font-medium">{method.bank.name}</span>
                      {method.isDefault && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {method.bank.accountType} •••• {method.bank.last4} • {method.bank.holderName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!method.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSetDefault(method.id);
                    toast.success('Método de pagamento padrão atualizado');
                  }}
                  title="Definir como padrão"
                >
                  <StarOff className="size-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Tem certeza que deseja remover este método de pagamento?')) {
                    onDelete(method.id);
                    toast.success('Método de pagamento removido');
                  }
                }}
                title="Remover"
              >
                <Trash2 className="size-4 text-red-600" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
