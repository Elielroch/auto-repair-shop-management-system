import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ordensServicoAPI, clientesAPI, veiculosAPI } from '../services/api';
import { Plus, Edit, Trash2, ClipboardList, User, Car, Calendar, DollarSign } from 'lucide-react';

const OrdensServico = () => {
  const [ordens, setOrdens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [veiculosCliente, setVeiculosCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [formData, setFormData] = useState({
    cliente_id: '',
    veiculo_id: '',
    data_entrada: new Date().toISOString().split('T')[0],
    defeito_relatado: '',
    servicos_a_realizar: '',
    valor_mao_obra: '',
    status: 'Em andamento'
  });

  const statusOptions = ['Em andamento', 'Pronto', 'Entregue'];
  const statusColors = {
    'Em andamento': 'bg-yellow-100 text-yellow-800',
    'Pronto': 'bg-orange-100 text-orange-800',
    'Entregue': 'bg-green-100 text-green-800'
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (formData.cliente_id) {
      carregarVeiculosCliente(formData.cliente_id);
    } else {
      setVeiculosCliente([]);
      setFormData(prev => ({ ...prev, veiculo_id: '' }));
    }
  }, [formData.cliente_id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [ordensResponse, clientesResponse, veiculosResponse] = await Promise.all([
        ordensServicoAPI.listar(),
        clientesAPI.listar(),
        veiculosAPI.listar()
      ]);
      setOrdens(ordensResponse.data);
      setClientes(clientesResponse.data);
      setVeiculos(veiculosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarVeiculosCliente = async (clienteId) => {
    try {
      const response = await veiculosAPI.listarPorCliente(clienteId);
      setVeiculosCliente(response.data);
    } catch (error) {
      console.error('Erro ao carregar veículos do cliente:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dadosOrdem = {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        veiculo_id: parseInt(formData.veiculo_id),
        valor_mao_obra: formData.valor_mao_obra ? parseFloat(formData.valor_mao_obra) : 0
      };

      if (editingOrdem) {
        await ordensServicoAPI.atualizar(editingOrdem.id, dadosOrdem);
      } else {
        await ordensServicoAPI.criar(dadosOrdem);
      }
      
      resetForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar ordem de serviço:', error);
      alert('Erro ao salvar ordem de serviço');
    }
  };

  const handleEdit = (ordem) => {
    setEditingOrdem(ordem);
    setFormData({
      cliente_id: ordem.cliente_id.toString(),
      veiculo_id: ordem.veiculo_id.toString(),
      data_entrada: ordem.data_entrada,
      defeito_relatado: ordem.defeito_relatado || '',
      servicos_a_realizar: ordem.servicos_a_realizar || '',
      valor_mao_obra: ordem.valor_mao_obra ? ordem.valor_mao_obra.toString() : '',
      status: ordem.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      try {
        await ordensServicoAPI.excluir(id);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir ordem de serviço:', error);
        alert('Erro ao excluir ordem de serviço');
      }
    }
  };

  const handleStatusChange = async (ordemId, novoStatus) => {
    try {
      await ordensServicoAPI.atualizarStatus(ordemId, novoStatus);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      veiculo_id: '',
      data_entrada: new Date().toISOString().split('T')[0],
      defeito_relatado: '',
      servicos_a_realizar: '',
      valor_mao_obra: '',
      status: 'Em andamento'
    });
    setShowForm(false);
    setEditingOrdem(null);
    setVeiculosCliente([]);
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const getVeiculoPlaca = (veiculoId) => {
    const veiculo = veiculos.find(v => v.id === veiculoId);
    return veiculo ? veiculo.placa : 'Veículo não encontrado';
  };

  const ordensFiltradas = filtroStatus 
    ? ordens.filter(ordem => ordem.status === filtroStatus)
    : ordens;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600 mt-1">Gerencie as ordens de serviço da oficina</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Ordem</span>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="filtro-status">Filtrar por status:</Label>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingOrdem ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cliente_id">Cliente *</Label>
                  <Select 
                    value={formData.cliente_id} 
                    onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="veiculo_id">Veículo *</Label>
                  <Select 
                    value={formData.veiculo_id} 
                    onValueChange={(value) => setFormData({ ...formData, veiculo_id: value })}
                    disabled={!formData.cliente_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {veiculosCliente.map((veiculo) => (
                        <SelectItem key={veiculo.id} value={veiculo.id.toString()}>
                          {veiculo.placa} - {veiculo.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="data_entrada">Data de Entrada</Label>
                  <Input
                    id="data_entrada"
                    type="date"
                    value={formData.data_entrada}
                    onChange={(e) => setFormData({ ...formData, data_entrada: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="defeito_relatado">Defeito Relatado</Label>
                <Textarea
                  id="defeito_relatado"
                  value={formData.defeito_relatado}
                  onChange={(e) => setFormData({ ...formData, defeito_relatado: e.target.value })}
                  placeholder="Descreva o problema relatado pelo cliente"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="servicos_a_realizar">Serviços a Realizar</Label>
                <Textarea
                  id="servicos_a_realizar"
                  value={formData.servicos_a_realizar}
                  onChange={(e) => setFormData({ ...formData, servicos_a_realizar: e.target.value })}
                  placeholder="Liste os serviços que serão realizados"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_mao_obra">Valor da Mão de Obra (R$)</Label>
                  <Input
                    id="valor_mao_obra"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_mao_obra}
                    onChange={(e) => setFormData({ ...formData, valor_mao_obra: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingOrdem ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ordens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ordensFiltradas.map((ordem) => (
          <Card key={ordem.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">OS #{ordem.id}</h3>
                    <Badge className={statusColors[ordem.status]}>
                      {ordem.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(ordem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(ordem.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{getClienteNome(ordem.cliente_id)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Car className="h-4 w-4" />
                  <span>{getVeiculoPlaca(ordem.veiculo_id)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>R$ {(ordem.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {ordem.defeito_relatado && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Defeito:</span>
                    <p className="text-gray-600 mt-1">{ordem.defeito_relatado}</p>
                  </div>
                )}
                
                {ordem.servicos_a_realizar && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Serviços:</span>
                    <p className="text-gray-600 mt-1">{ordem.servicos_a_realizar}</p>
                  </div>
                )}
                
                {/* Botões de mudança de status */}
                <div className="flex space-x-2 pt-2">
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={ordem.status === status ? "default" : "outline"}
                      onClick={() => handleStatusChange(ordem.id, status)}
                      disabled={ordem.status === status}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ordensFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filtroStatus ? `Nenhuma ordem com status "${filtroStatus}"` : 'Nenhuma ordem de serviço cadastrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {filtroStatus ? 'Tente alterar o filtro ou criar uma nova ordem.' : 'Comece criando a primeira ordem de serviço.'}
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem de Serviço
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrdensServico;

