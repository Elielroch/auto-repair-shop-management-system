import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ordensServicoAPI, clientesAPI, veiculosAPI, pecasAPI } from '../services/api';
import { Plus, Edit, Trash2, ClipboardList, User, Car, Calendar, DollarSign, Package } from 'lucide-react';

const OrdensServico = () => {
  const [ordens, setOrdens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [pecasDisponiveis, setPecasDisponiveis] = useState([]);
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
    status: 'Em andamento',
    pecas_utilizadas: [] // Para armazenar peças na criação/edição
  });
  const [novaPecaUtilizada, setNovaPecaUtilizada] = useState({
    peca_id: '',
    quantidade: 1
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
      const [ordensResponse, clientesResponse, veiculosResponse, pecasResponse] = await Promise.all([
        ordensServicoAPI.listar(),
        clientesAPI.listar(),
        veiculosAPI.listar(),
        pecasAPI.listar()
      ]);
      setOrdens(Array.isArray(ordensResponse?.data) ? ordensResponse.data : []);
      setClientes(Array.isArray(clientesResponse?.data) ? clientesResponse.data : []);
      setVeiculos(Array.isArray(veiculosResponse?.data) ? veiculosResponse.data : []);
      setPecasDisponiveis(Array.isArray(pecasResponse?.data) ? pecasResponse.data : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setOrdens([]);
      setClientes([]);
      setVeiculos([]);
      setPecasDisponiveis([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarVeiculosCliente = async (clienteId) => {
    try {
      const response = await veiculosAPI.listarPorCliente(clienteId);
      setVeiculosCliente(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar veículos do cliente:', error);
      setVeiculosCliente([]);
    }
  };

  const handleClienteChange = (clienteId) => {
    setFormData(prev => ({ ...prev, cliente_id: clienteId, veiculo_id: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cliente_id) {
      alert('Selecione um cliente.');
      return;
    }
    if (!formData.veiculo_id) {
      alert('Selecione um veículo.');
      return;
    }

    try {
      const dadosOrdem = {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        veiculo_id: parseInt(formData.veiculo_id),
        valor_mao_obra: formData.valor_mao_obra ? parseFloat(formData.valor_mao_obra) : 0,
        pecas_utilizadas: formData.pecas_utilizadas.map(pu => ({
          peca_id: parseInt(pu.peca_id),
          quantidade: parseInt(pu.quantidade)
        }))
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
      alert('Erro ao salvar ordem de serviço: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = async (ordem) => {
    try {
      const response = await ordensServicoAPI.obter(ordem.id);
      const ordemCompleta = response.data;

      setEditingOrdem(ordemCompleta);
      setFormData({
        cliente_id: ordemCompleta.cliente_id.toString(),
        veiculo_id: ordemCompleta.veiculo_id.toString(),
        data_entrada: ordemCompleta.data_entrada,
        defeito_relatado: ordemCompleta.defeito_relatado || '',
        servicos_a_realizar: ordemCompleta.servicos_a_realizar || '',
        valor_mao_obra: ordemCompleta.valor_mao_obra ? ordemCompleta.valor_mao_obra.toString() : '',
        status: ordemCompleta.status,
        pecas_utilizadas: ordemCompleta.pecas_utilizadas || []
      });
      setShowForm(true);
    } catch (error) {
      console.error('Erro ao carregar ordem para edição:', error);
      alert('Erro ao carregar ordem para edição.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      try {
        await ordensServicoAPI.excluir(id);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir ordem de serviço:', error);
        alert('Erro ao excluir ordem de serviço: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleStatusChange = async (ordemId, novoStatus) => {
    try {
      await ordensServicoAPI.atualizarStatus(ordemId, novoStatus);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddPecaUtilizada = () => {
    if (!novaPecaUtilizada.peca_id || novaPecaUtilizada.quantidade <= 0) {
      alert('Selecione uma peça e uma quantidade válida.');
      return;
    }
    const pecaExistente = pecasDisponiveis.find(p => String(p.id) === String(novaPecaUtilizada.peca_id));
    if (!pecaExistente) {
      alert('Peça selecionada não encontrada.');
      return;
    }

    const pecaJaAdicionada = formData.pecas_utilizadas.find(pu => String(pu.peca_id) === String(novaPecaUtilizada.peca_id));
    if (pecaJaAdicionada) {
      alert('Esta peça já foi adicionada a esta ordem de serviço. Edite a quantidade existente.');
      return;
    }

    const novaPeca = {
      peca_id: pecaExistente.id,
      peca_nome: pecaExistente.nome,
      preco_unitario: pecaExistente.preco_unitario,
      quantidade: novaPecaUtilizada.quantidade,
      preco_total: pecaExistente.preco_unitario * novaPecaUtilizada.quantidade
    };

    setFormData(prev => ({
      ...prev,
      pecas_utilizadas: [...prev.pecas_utilizadas, novaPeca]
    }));
    setNovaPecaUtilizada({ peca_id: '', quantidade: 1 });
  };

  const handleRemovePecaUtilizada = (index) => {
    setFormData(prev => ({
      ...prev,
      pecas_utilizadas: prev.pecas_utilizadas.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      veiculo_id: '',
      data_entrada: new Date().toISOString().split('T')[0],
      defeito_relatado: '',
      servicos_a_realizar: '',
      valor_mao_obra: '',
      status: 'Em andamento',
      pecas_utilizadas: []
    });
    setShowForm(false);
    setEditingOrdem(null);
    setVeiculosCliente([]);
    setNovaPecaUtilizada({ peca_id: '', quantidade: 1 });
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const getVeiculoPlaca = (veiculoId) => {
    const veiculo = veiculos.find(v => v.id === veiculoId);
    return veiculo ? veiculo.placa : 'Veículo não encontrado';
  };

  const calcularValorTotalOrdem = (ordem) => {
    const valorPecas = (ordem.pecas_utilizadas || []).reduce((acc, peca) => acc + (peca.preco_total || 0), 0);
    return (ordem.valor_mao_obra || 0) + valorPecas;
  };

  const ordensFiltradas = filtroStatus 
    ? (ordens || []).filter(ordem => ordem?.status === filtroStatus)
    : ordens || [];

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
            <select
              id="filtro-status"
              className="w-48 border rounded px-3 py-2"
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
                  <select
                    id="cliente_id"
                    className="w-full border rounded px-3 py-2"
                    value={formData.cliente_id || ""}
                    onChange={e => handleClienteChange(e.target.value)}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {Array.isArray(clientes) &&
                      clientes
                        .filter(c => c && typeof c.id === "number" && c.id > 0)
                        .map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome || "Sem nome"}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="veiculo_id">Veículo *</Label>
                  <select
                    id="veiculo_id"
                    className="w-full border rounded px-3 py-2"
                    value={formData.veiculo_id || ""}
                    onChange={e => setFormData({ ...formData, veiculo_id: e.target.value })}
                    disabled={!formData.cliente_id}
                    required
                  >
                    <option value="">Selecione um veículo</option>
                    {Array.isArray(veiculosCliente) &&
                      veiculosCliente
                        .filter(
                          (v, idx, arr) =>
                            v &&
                            typeof v.id === "number" &&
                            v.id > 0 &&
                            typeof v.placa === "string" &&
                            v.placa.trim() !== "" &&
                            arr.findIndex(veic => veic.id === v.id) === idx
                        )
                        .map((veiculo) => (
                          <option key={veiculo.id} value={veiculo.id}>
                            {`${veiculo.placa} - ${veiculo.modelo || "Sem modelo"}`}
                          </option>
                        ))}
                  </select>
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
                  <select
                    id="status"
                    className="w-full border rounded px-3 py-2"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seção de Peças Utilizadas */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Peças Utilizadas</h3>
                {formData.pecas_utilizadas.map((peca, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span>{peca.peca_nome} (x{peca.quantidade}) - R$ {peca.preco_total.toFixed(2)}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemovePecaUtilizada(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <select
                    className="w-[180px] border rounded px-3 py-2"
                    value={novaPecaUtilizada.peca_id || ""}
                    onChange={e => setNovaPecaUtilizada(prev => ({ ...prev, peca_id: e.target.value }))}
                  >
                    <option value="">Selecione uma peça</option>
                    {Array.isArray(pecasDisponiveis) &&
                      pecasDisponiveis
                        .filter(p => p && typeof p.id === "number" && p.id > 0)
                        .map((peca) => (
                          <option key={peca.id} value={peca.id}>
                            {`${peca.nome} - R$ ${peca.preco_unitario.toFixed(2)}`}
                          </option>
                        ))}
                  </select>
                  
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={novaPecaUtilizada.quantidade}
                    onChange={(e) => setNovaPecaUtilizada(prev => ({ ...prev, quantidade: Math.max(1, e.target.value) }))}
                    placeholder="Quantidade"
                    className="w-24"
                  />
                  
                  <Button 
                    onClick={handleAddPecaUtilizada}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Peça</span>
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  onClick={resetForm} 
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
                <Button 
                  type="submit"
                  className="flex items-center space-x-2"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>{editingOrdem ? 'Atualizar Ordem' : 'Criar Ordem'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ordens */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {ordensFiltradas.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhuma ordem de serviço encontrada.
            </div>
          ) : (
            <div className="space-y-4">
              {ordensFiltradas.map((ordem) => (
                <div 
                  key={ordem.id} 
                  className="p-4 bg-white rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Ordem #{ordem.id}
                    </h3>
                    <p className="text-gray-600">
                      Cliente: {getClienteNome(ordem.cliente_id)} - Veículo: {getVeiculoPlaca(ordem.veiculo_id)}
                    </p>
                    <p className="text-gray-600">
                      Data de Entrada: {new Date(ordem.data_entrada).toLocaleDateString('pt-BR')} - Status: 
                      <Badge className={`ml-2 ${statusColors[ordem.status]}`}>
                        {ordem.status}
                      </Badge>
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="flex space-x-2 mt-2 md:mt-0">
                      <Button 
                        onClick={() => handleEdit(ordem)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span>Editar</span>
                      </Button>
                      <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(ordem.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span>Excluir</span>
                  </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdensServico;
