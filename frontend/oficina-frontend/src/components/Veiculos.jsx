import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { veiculosAPI, clientesAPI } from '../services/api';
import { Plus, Edit, Trash2, Car, User } from 'lucide-react';

const Veiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState(null);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    ano: '',
    quilometragem: '',
    cliente_id: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [veiculosResponse, clientesResponse] = await Promise.all([
        veiculosAPI.listar(),
        clientesAPI.listar()
      ]);
      setVeiculos(veiculosResponse.data);
      setClientes(clientesResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dadosVeiculo = {
        ...formData,
        ano: formData.ano ? parseInt(formData.ano) : null,
        quilometragem: formData.quilometragem ? parseInt(formData.quilometragem) : null,
        cliente_id: parseInt(formData.cliente_id)
      };

      if (editingVeiculo) {
        await veiculosAPI.atualizar(editingVeiculo.id, dadosVeiculo);
      } else {
        await veiculosAPI.criar(dadosVeiculo);
      }
      
      resetForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert('Erro ao salvar veículo');
    }
  };

  const handleEdit = (veiculo) => {
    setEditingVeiculo(veiculo);
    setFormData({
      placa: veiculo.placa,
      modelo: veiculo.modelo || '',
      ano: veiculo.ano ? veiculo.ano.toString() : '',
      quilometragem: veiculo.quilometragem ? veiculo.quilometragem.toString() : '',
      cliente_id: veiculo.cliente_id.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        await veiculosAPI.excluir(id);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir veículo:', error);
        alert('Erro ao excluir veículo');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      placa: '',
      modelo: '',
      ano: '',
      quilometragem: '',
      cliente_id: ''
    });
    setShowForm(false);
    setEditingVeiculo(null);
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-600 mt-1">Gerencie os veículos dos clientes</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Veículo</span>
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingVeiculo ? 'Editar Veículo' : 'Novo Veículo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placa">Placa *</Label>
                  <Input
                    id="placa"
                    type="text"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    required
                    placeholder="ABC-1234"
                    maxLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ex: Honda Civic"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ano">Ano</Label>
                  <Input
                    id="ano"
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <Label htmlFor="quilometragem">Quilometragem</Label>
                  <Input
                    id="quilometragem"
                    type="number"
                    value={formData.quilometragem}
                    onChange={(e) => setFormData({ ...formData, quilometragem: e.target.value })}
                    placeholder="50000"
                    min="0"
                  />
                </div>
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
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingVeiculo ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {veiculos.map((veiculo) => (
          <Card key={veiculo.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-full">
                    <Car className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{veiculo.placa}</h3>
                    <p className="text-sm text-gray-500">{veiculo.modelo || 'Modelo não informado'}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(veiculo)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(veiculo.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{getClienteNome(veiculo.cliente_id)}</span>
                </div>
                {veiculo.ano && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Ano:</span> {veiculo.ano}
                  </div>
                )}
                {veiculo.quilometragem && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">KM:</span> {veiculo.quilometragem.toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {veiculos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum veículo cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando o primeiro veículo.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Veículo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Veiculos;

