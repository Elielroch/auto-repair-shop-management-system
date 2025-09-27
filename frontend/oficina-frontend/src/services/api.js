import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

// Serviços de Clientes
export const clientesAPI = {
  listar: () => api.get('/clientes'),
  obter: (id) => api.get(`/clientes/${id}`),
  criar: (cliente) => api.post('/clientes', cliente),
  atualizar: (id, cliente) => api.put(`/clientes/${id}`, cliente),
  excluir: (id) => api.delete(`/clientes/${id}`),
};

// Serviços de Veículos
export const veiculosAPI = {
  listar: () => api.get('/veiculos'),
  obter: (id) => api.get(`/veiculos/${id}`),
  listarPorCliente: (clienteId) => api.get(`/veiculos/cliente/${clienteId}`),
  buscarPorPlaca: (placa) => api.get(`/veiculos/buscar/${placa}`),
  criar: (veiculo) => api.post('/veiculos', veiculo),
  atualizar: (id, veiculo) => api.put(`/veiculos/${id}`, veiculo),
  excluir: (id) => api.delete(`/veiculos/${id}`),
};

// Serviços de Ordens de Serviço
export const ordensServicoAPI = {
  listar: (status = null) => api.get('/ordens_servico', { params: status ? { status } : {} }),
  obter: (id) => api.get(`/ordens_servico/${id}`),
  criar: (ordem) => api.post('/ordens_servico', ordem),
  atualizar: (id, ordem) => api.put(`/ordens_servico/${id}`, ordem),
  atualizarStatus: (id, status) => api.put(`/ordens_servico/${id}/status`, { status }),
  excluir: (id) => api.delete(`/ordens_servico/${id}`),
  gerarOrcamento: (id) => api.get(`/ordens_servico/${id}/orcamento`),
};

// Serviços de Peças
export const pecasAPI = {
  listar: () => api.get('/pecas'),
  obter: (id) => api.get(`/pecas/${id}`),
  criar: (peca) => api.post('/pecas', peca),
  atualizar: (id, peca) => api.put(`/pecas/${id}`, peca),
  excluir: (id) => api.delete(`/pecas/${id}`),
  
  // Peças utilizadas em ordens de serviço
  listarPecasOrdem: (osId) => api.get(`/ordens_servico/${osId}/pecas`),
  adicionarPecaOrdem: (osId, peca) => api.post(`/ordens_servico/${osId}/pecas`, peca),
  removerPecaOrdem: (osId, pecaUtilizadaId) => api.delete(`/ordens_servico/${osId}/pecas/${pecaUtilizadaId}`),
};

// Serviços de Relatórios
export const relatoriosAPI = {
  faturamentoMensal: (ano = null, mes = null) => 
    api.get('/relatorios/faturamento_mensal', { params: { ano, mes } }),
  pecasMaisUsadas: (dias = 30) => 
    api.get('/relatorios/pecas_mais_usadas', { params: { dias } }),
  servicosMaisRealizados: (dias = 30) => 
    api.get('/relatorios/servicos_mais_realizados', { params: { dias } }),
  dashboard: () => api.get('/relatorios/dashboard'),
};

export default api;
