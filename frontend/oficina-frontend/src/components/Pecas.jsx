import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { pecasAPI } from '../services/api';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

const Pecas = () => {
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPeca, setEditingPeca] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco_unitario: '',
    estoque: ''
  });

  useEffect(() => {
    carregarPecas();
  }, []);

  const carregarPecas = async () => {
    try {
      setLoading(true);
      const response = await pecasAPI.listar();
      setPecas(response.data);
    } catch (error) {
      console.error('Erro ao carregar peças:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dadosPeca = {
        ...formData,
        preco_unitario: parseFloat(formData.preco_unitario),
        estoque: parseInt(formData.estoque)
      };

      if (editingPeca) {
        await pecasAPI.atualizar(editingPeca.id, dadosPeca);
      } else {
        await pecasAPI.criar(dadosPeca);
      }
      
      resetForm();
      carregarPecas();
    } catch (error) {
      console.error('Erro ao salvar peça:', error);
      alert('Erro ao salvar peça');
    }
  };

  const handleEdit = (peca) => {
    setEditingPeca(peca);
    setFormData({
      nome: peca.nome,
      preco_unitario: peca.preco_unitario.toString(),
      estoque: peca.estoque.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta peça?')) {
      try {
        await pecasAPI.excluir(id);
        carregarPecas();
      } catch (error) {
        console.error('Erro ao excluir peça:', error);
        alert('Erro ao excluir peça');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      preco_unitario: '',
      estoque: ''
    });
    setShowForm(false);
    setEditingPeca(null);
  };

  const getEstoqueStatus = (estoque) => {
    if (estoque === 0) {
      return { label: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    } else if (estoque <= 5) {
      return { label: 'Estoque baixo', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Em estoque', color: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Peças</h1>
          <p className="text-gray-600 mt-1">Gerencie o estoque de peças da oficina</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Peça</span>
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Peças</p>
                <p className="text-2xl font-bold">{pecas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold">
                  {pecas.filter(p => p.estoque > 0 && p.estoque <= 5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Sem Estoque</p>
                <p className="text-2xl font-bold">
                  {pecas.filter(p => p.estoque === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPeca ? 'Editar Peça' : 'Nova Peça'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Peça *</Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Filtro de óleo, Pastilha de freio"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preco_unitario">Preço Unitário (R$) *</Label>
                  <Input
                    id="preco_unitario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_unitario}
                    onChange={(e) => setFormData({ ...formData, preco_unitario: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estoque">Quantidade em Estoque *</Label>
                  <Input
                    id="estoque"
                    type="number"
                    min="0"
                    value={formData.estoque}
                    onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                    required
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingPeca ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Peças */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pecas.map((peca) => {
          const estoqueStatus = getEstoqueStatus(peca.estoque);
          
          return (
            <Card key={peca.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-50 rounded-full">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{peca.nome}</h3>
                      <p className="text-sm text-gray-500">ID: {peca.id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(peca)}
                      className="hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(peca.id)}                      
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span>Excluir</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preço Unitário:</span>
                    <span className="font-semibold text-green-600">
                      R$ {peca.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estoque:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{peca.estoque}</span>
                      <Badge className={estoqueStatus.color}>
                        {estoqueStatus.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor Total:</span>
                    <span className="font-semibold">
                      R$ {(peca.preco_unitario * peca.estoque).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pecas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma peça cadastrada
            </h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando as primeiras peças ao estoque.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Peça
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pecas;
