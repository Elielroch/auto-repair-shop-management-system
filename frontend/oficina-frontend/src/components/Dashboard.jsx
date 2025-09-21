import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { relatoriosAPI } from '../services/api';
import { 
  Users, 
  Car, 
  ClipboardList, 
  DollarSign,
  Clock,
  CheckCircle,
  Package
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const response = await relatoriosAPI.dashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const { estatisticas_gerais, faturamento_mes_atual } = dashboardData || {};

  const cards = [
    {
      title: 'Clientes Ativos',
      value: estatisticas_gerais?.total_clientes_ativos || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Veículos Ativos',
      value: estatisticas_gerais?.total_veiculos_ativos || 0,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Em Andamento',
      value: estatisticas_gerais?.ordens_em_andamento || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Prontos',
      value: estatisticas_gerais?.ordens_prontas || 0,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Entregues',
      value: estatisticas_gerais?.ordens_entregues || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Faturamento do Mês',
      value: `R$ ${(faturamento_mes_atual?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral da oficina</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações do Mês */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Faturamento do Mês</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mês/Ano:</span>
                <span className="font-semibold">
                  {faturamento_mes_atual?.mes}/{faturamento_mes_atual?.ano}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Ordens:</span>
                <span className="font-semibold">{faturamento_mes_atual?.total_ordens || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  R$ {(faturamento_mes_atual?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5" />
              <span>Status das Ordens</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">Em Andamento:</span>
                </div>
                <span className="font-semibold">{estatisticas_gerais?.ordens_em_andamento || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Prontos:</span>
                </div>
                <span className="font-semibold">{estatisticas_gerais?.ordens_prontas || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Entregues:</span>
                </div>
                <span className="font-semibold">{estatisticas_gerais?.ordens_entregues || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

