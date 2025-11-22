import { motion } from 'motion/react';
import { Button } from './ui/button';
import { 
  Building2, 
  FileText, 
  Receipt, 
  TrendingUp, 
  Users,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Clock,
  Shield,
  BarChart3,
  Upload,
  CreditCard,
  Bell,
  Layers,
  ChevronRight
} from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

export function Landing({ onGetStarted, onLoginClick }: LandingProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-yellow-200"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-xl">
                <Building2 className="size-5 text-stone-900" />
              </div>
              <span className="font-semibold text-stone-900">Minha Obra</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#features" className="text-stone-600 hover:text-stone-900 transition-colors hidden md:block">
                Recursos
              </a>
              <a href="#how-it-works" className="text-stone-600 hover:text-stone-900 transition-colors hidden md:block">
                Como funciona
              </a>
              <Button
                onClick={onLoginClick}
                variant="ghost"
                className="text-stone-700 hover:text-yellow-600 hover:bg-yellow-50 text-[14px] bg-[rgba(0,0,0,0.36)]"
              >
                Entrar
              </Button>
              <Button
                onClick={onGetStarted}
                className="bg-yellow-500 hover:bg-yellow-600 text-stone-900 font-semibold"
              >
                Começar
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>


              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 mb-6 leading-[1.05] tracking-tight"
              >
                Controle total do orçamento da sua obra
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-stone-600 mb-10 leading-relaxed"
              >
                Gerencie despesas, aprove pagamentos e acompanhe cada centavo investido. 
                Plataforma completa para contratantes que querem profissionalizar sua gestão.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-yellow-500 hover:bg-yellow-600 text-stone-900 px-10 py-6 text-lg rounded-xl group font-semibold"
                >
                  Começar gratuitamente
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-stone-300 text-stone-700 hover:bg-stone-50 px-8 py-6 text-base rounded-xl"
                >
                  Ver demonstração
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-6 text-sm text-stone-600"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-yellow-600" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-yellow-600" />
                  <span>Setup em 5 minutos</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-yellow-50 to-stone-50 rounded-2xl p-8 border border-stone-200 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <BarChart3 className="size-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-stone-600">Orçamento Total</p>
                        <p className="text-2xl font-bold text-stone-900">R$ 450.000</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-stone-600">Gasto</p>
                      <p className="text-xl font-semibold text-yellow-600">68%</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-2 bg-yellow-500 rounded-full" />
                        <span className="text-sm text-stone-700">Materiais</span>
                      </div>
                      <span className="text-sm font-semibold text-stone-900">R$ 180.500</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-2 bg-stone-400 rounded-full" />
                        <span className="text-sm text-stone-700">Mão de obra</span>
                      </div>
                      <span className="text-sm font-semibold text-stone-900">R$ 125.000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-2 bg-stone-300 rounded-full" />
                        <span className="text-sm text-stone-700">Equipamentos</span>
                      </div>
                      <span className="text-sm font-semibold text-stone-900">R$ 32.500</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="size-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-600">Última atualização</p>
                    <p className="text-sm font-semibold text-stone-900">Agora mesmo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-6 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 'Tempo Real', label: 'Sincronização automática' },
              { value: 'Múltiplos', label: 'Projetos simultâneos' },
              { value: '100%', label: 'Digital e organizado' },
              { value: 'Seguro', label: 'Dados criptografados' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl font-bold text-stone-900 mb-1">{stat.value}</p>
                <p className="text-sm text-stone-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-stone-900 mb-6 tracking-tight">
              Orçamento e despesas sob controle
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Todas as ferramentas que você precisa para gerenciar o financeiro da obra do início ao fim
            </p>
          </motion.div>

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full mb-6">
                <DollarSign className="size-4 text-yellow-600" />
                <span className="text-sm text-stone-700">Orçamento Detalhado</span>
              </div>
              <h3 className="text-4xl font-bold text-stone-900 mb-6">
                Defina limites por categoria
              </h3>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Crie orçamentos separados para materiais, mão de obra, equipamentos e outras categorias. 
                Acompanhe quanto foi gasto em cada uma e receba alertas quando se aproximar do limite.
              </p>
              <ul className="space-y-4">
                {[
                  'Orçamento por fase da obra',
                  'Alertas automáticos de gastos',
                  'Comparação planejado vs real',
                  'Relatórios de variação de custo'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-2xl p-8 border border-stone-200"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-stone-900">Categorias de Orçamento</h4>
                  <Button size="sm" variant="ghost" className="text-yellow-600 hover:bg-yellow-50">
                    Editar
                  </Button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Materiais', budget: 200000, spent: 180500, color: 'bg-yellow-500' },
                    { name: 'Mão de obra', budget: 150000, spent: 125000, color: 'bg-stone-600' },
                    { name: 'Equipamentos', budget: 50000, spent: 32500, color: 'bg-stone-400' },
                    { name: 'Outros', budget: 50000, spent: 18000, color: 'bg-stone-300' }
                  ].map((category, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-stone-700">{category.name}</span>
                        <span className="text-sm text-stone-600">
                          R$ {(category.spent / 1000).toFixed(0)}k / R$ {(category.budget / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${category.color} rounded-full`}
                          style={{ width: `${(category.spent / category.budget) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-2xl p-8 border border-stone-200"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-stone-900">Despesas Recentes</h4>
                  <span className="text-xs text-stone-500">Hoje</span>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Cimento e areia', amount: 'R$ 3.450', category: 'Materiais', status: 'pending' },
                    { name: 'Pedreiro - Semana 12', amount: 'R$ 2.800', category: 'Mão de obra', status: 'approved' },
                    { name: 'Aluguel betoneira', amount: 'R$ 890', category: 'Equipamentos', status: 'pending' }
                  ].map((expense, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-white rounded-lg border border-stone-200">
                          <Receipt className="size-4 text-stone-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-900">{expense.name}</p>
                          <p className="text-xs text-stone-500">{expense.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-900">{expense.amount}</p>
                        {expense.status === 'pending' ? (
                          <span className="text-xs text-amber-700">Pendente</span>
                        ) : (
                          <span className="text-xs text-green-700">Aprovado</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full mb-6">
                <Upload className="size-4 text-amber-800" />
                <span className="text-sm text-stone-700">Gestão de Despesas</span>
              </div>
              <h3 className="text-4xl font-bold text-stone-900 mb-6">
                Registre e organize todos os gastos
              </h3>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Adicione despesas rapidamente com upload de notas fiscais, recibos e comprovantes. 
                Organize automaticamente por categoria e acompanhe tudo em tempo real.
              </p>
              <ul className="space-y-4">
                {[
                  'Upload de notas fiscais e recibos',
                  'Categorização automática',
                  'Anexo de comprovantes de pagamento',
                  'Histórico completo de transações'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-amber-800 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full mb-6">
                <CreditCard className="size-4 text-amber-800" />
                <span className="text-sm text-stone-700">Pagamentos Integrados</span>
              </div>
              <h3 className="text-4xl font-bold text-stone-900 mb-6">
                Aprove e pague diretamente
              </h3>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Revise despesas enviadas pelo contratante e efetue pagamentos via PIX, cartão de crédito 
                ou boleto bancário sem sair da plataforma.
              </p>
              <ul className="space-y-4">
                {[
                  'Aprovação com um clique',
                  'Pagamento via PIX instantâneo',
                  'Cartão de crédito e boleto',
                  'Histórico completo de pagamentos'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-amber-800 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-2xl p-8 border border-stone-200"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="mb-6">
                  <h4 className="font-semibold text-stone-900 mb-2">Aprovar Pagamento</h4>
                  <p className="text-sm text-stone-600">Pedreiro - Semana 12</p>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <span className="text-sm text-stone-600">Valor</span>
                    <span className="text-lg font-bold text-stone-900">R$ 2.800,00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <span className="text-sm text-stone-600">Categoria</span>
                    <span className="text-sm font-medium text-stone-900">Mão de obra</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <span className="text-sm text-stone-600">Data</span>
                    <span className="text-sm font-medium text-stone-900">18/11/2025</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-stone-900 rounded-lg font-medium transition-colors">
                    Aprovar e Pagar com PIX
                  </button>
                  <button className="w-full py-3 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg font-medium transition-colors">
                    Aprovar e Pagar com Cartão
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-stone-900 mb-6 tracking-tight">
              Como funciona
            </h2>
            <p className="text-xl text-stone-600">
              Configure em minutos e comece a gerenciar hoje mesmo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                number: '01',
                title: 'Crie seu projeto',
                description: 'Configure a obra, defina o orçamento por categoria e convide membros da equipe.'
              },
              {
                number: '02',
                title: 'Adicione despesas',
                description: 'Registre gastos com upload de notas fiscais. Tudo organizado automaticamente.'
              },
              {
                number: '03',
                title: 'Aprove pagamentos',
                description: 'Revise e aprove despesas. Pague via PIX, cartão ou boleto direto da plataforma.'
              },
              {
                number: '04',
                title: 'Acompanhe em tempo real',
                description: 'Visualize dashboards, gráficos e relatórios atualizados automaticamente.'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-stone-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 text-stone-900 rounded-xl flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Benefits */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-stone-900 mb-6 tracking-tight">
              Mais recursos para você
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Ferramentas adicionais que fazem diferença no dia a dia
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Múltiplos Projetos',
                description: 'Gerencie várias obras simultaneamente com orçamentos e equipes independentes.'
              },
              {
                icon: Bell,
                title: 'Sincronização em Tempo Real',
                description: 'Atualizações instantâneas entre proprietários e contratantes. Sem atrasos.'
              },
              {
                icon: BarChart3,
                title: 'Relatórios Detalhados',
                description: 'Gráficos, métricas e análises para acompanhar o progresso financeiro.'
              },
              {
                icon: Shield,
                title: 'Segurança Garantida',
                description: 'Dados criptografados e backups automáticos. Sua informação protegida.'
              },
              {
                icon: Clock,
                title: 'Economia de Tempo',
                description: 'Automatize processos manuais e elimine planilhas desatualizadas.'
              },
              {
                icon: Layers,
                title: 'Importação de Excel',
                description: 'Importe suas planilhas existentes e migre seus dados em segundos.'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group"
              >
                <div className="mb-6">
                  <div className="inline-flex p-3 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors">
                    <benefit.icon className="size-6 text-amber-800" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-stone-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Pronto para transformar a gestão da sua obra?
            </h2>
            <p className="text-xl text-stone-300 mb-10 max-w-2xl mx-auto">
              Comece gratuitamente hoje e veja como é simples ter controle total do orçamento
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-yellow-500 hover:bg-yellow-600 text-stone-900 px-10 py-6 text-lg rounded-xl group font-semibold"
              >
                Começar gratuitamente
                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-stone-300 text-white hover:bg-stone-800 hover:text-white px-10 py-6 text-lg rounded-xl bg-transparent"
              >
                Agendar demonstração
              </Button>
            </div>
            <p className="text-sm text-stone-400 mt-8">
              Sem cartão de crédito • Configure em 5 minutos • Suporte em português
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[rgb(240,177,0)] rounded-xl">
                  <Building2 className="size-5 text-white" />
                </div>
                <span className="font-semibold text-stone-900">Gestão de Obras</span>
              </div>
              <p className="text-stone-600 mb-6">
                Plataforma profissional para gestão de orçamento e despesas de construção. 
                Controle total, sincronização em tempo real.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 mb-4">Produto</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-stone-600 hover:text-stone-900 transition-colors">Recursos</a></li>
                <li><a href="#how-it-works" className="text-stone-600 hover:text-stone-900 transition-colors">Como funciona</a></li>
                <li><a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 mb-4">Empresa</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Sobre</a></li>
                <li><a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Contato</a></li>
                <li><a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Suporte</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-600 text-sm">
              © 2025 Gestão de Obras. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Privacidade</a>
              <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Termos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}