import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { relatoriosAPI } from '../services/api';
import { 
  BarChart3, 
  DollarSign, 
  Package, 
  Wrench, 
  Calendar,
  TrendingUp,
  Download
} from 'lucide-react';

const Relatorios = () => {
  const [faturamentoMensal, setFaturamentoMensal] = useState(null);
  const [pecasMaisUsadas, setPecasMaisUsadas] = useState(null);
  const [servicosMaisRealizados, setServicosMaisRealizados] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [diasPeriodo, setDiasPeriodo] = useState(30);

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    carregarRelatorios();
  }, [anoSelecionado, mesSelecionado, diasPeriodo]);

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      
      const [faturamentoResponse, pecasResponse, servicosResponse] = await Promise.all([
        relatoriosAPI.faturamentoMensal(anoSelecionado, mesSelecionado),
        relatoriosAPI.pecasMaisUsadas(diasPeriodo),
        relatoriosAPI.servicosMaisRealizados(diasPeriodo)
      ]);
      
      setFaturamentoMensal(faturamentoResponse.data);
      setPecasMaisUsadas(pecasResponse.data);
      setServicosMaisRealizados(servicosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = (tipo) => {
    // Função para exportar relatórios (implementação básica)
    let dados = '';
    let filename = '';
    
    switch (tipo) {
      case 'faturamento':
        dados = JSON.stringify(faturamentoMensal, null, 2);
        filename = `faturamento_${anoSelecionado}_${mesSelecionado}.json`;
        break;
      case 'pecas':
        dados = JSON.stringify(pecasMaisUsadas, null, 2);
        filename = `pecas_mais_usadas_${diasPeriodo}dias.json`;
        break;
      case 'servicos':
        dados = JSON.stringify(servicosMaisRealizados, null, 2);
        filename = `servicos_mais_realizados_${diasPeriodo}dias.json`;
        break;
    }
    
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando relatórios...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e estatísticas da oficina</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="ano">Ano (Faturamento)</Label>
              <Select value={anoSelecionado.toString()} onValueChange={(value) => setAnoSelecionado(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="mes">Mês (Faturamento)</Label>
              <Select value={mesSelecionado.toString()} onValueChange={(value) => setMesSelecionado(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value.toString()}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dias">Período (Peças/Serviços)</Label>
              <Select value={diasPeriodo.toString()} onValueChange={(value) => setDiasPeriodo(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={carregarRelatorios} className="w-full">
                Atualizar Relatórios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faturamento Mensal */}
      {faturamentoMensal && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Faturamento Mensal - {meses.find(m => m.value === mesSelecionado)?.label} {anoSelecionado}</span>
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportarRelatorio('faturamento')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  R$ {faturamentoMensal.total_faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">Faturamento Total</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {faturamentoMensal.total_ordens}
                </div>
                <div className="text-sm text-gray-600">Ordens Entregues</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  R$ {faturamentoMensal.total_ordens > 0 
                    ? (faturamentoMensal.total_faturamento / faturamentoMensal.total_ordens).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    : '0,00'
                  }
                </div>
                <div className="text-sm text-gray-600">Ticket Médio</div>
              </div>
            </div>
            
            {Object.keys(faturamentoMensal.faturamento_diario).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Faturamento por Dia</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(faturamentoMensal.faturamento_diario)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([dia, dados]) => (
                      <div key={dia} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Dia {dia}</span>
                        <div className="text-right">
                          <div className="font-semibold">
                            R$ {dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {dados.ordens} ordem{dados.ordens !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Peças Mais Usadas */}
      {pecasMaisUsadas && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Peças Mais Usadas - Últimos {diasPeriodo} dias</span>
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportarRelatorio('pecas')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pecasMaisUsadas.pecas_mais_usadas.length > 0 ? (
              <div className="space-y-3">
                {pecasMaisUsadas.pecas_mais_usadas.map((peca, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-semibold">{peca.nome}</div>
                      <div className="text-sm text-gray-600">
                        {peca.total_usos} uso{peca.total_usos !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {peca.total_quantidade} unidade{peca.total_quantidade !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-green-600">
                        R$ {peca.total_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma peça utilizada no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Serviços Mais Realizados */}
      {servicosMaisRealizados && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Serviços Mais Realizados - Últimos {diasPeriodo} dias</span>
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportarRelatorio('servicos')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-gray-600">
              Total de ordens no período: {servicosMaisRealizados.total_ordens_periodo}
            </div>
            
            {servicosMaisRealizados.servicos_mais_realizados.length > 0 ? (
              <div className="space-y-3">
                {servicosMaisRealizados.servicos_mais_realizados.map((servico, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-semibold">{servico.nome}</div>
                      <div className="text-sm text-gray-600">
                        {servico.quantidade} vez{servico.quantidade !== 1 ? 'es' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600">
                        R$ {servico.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        Valor total associado
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum serviço realizado no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Relatorios;

