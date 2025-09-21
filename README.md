# Sistema de Gestão de Oficina Mecânica

Um sistema completo para gerenciamento de oficinas mecânicas, desenvolvido com Flask (backend) e React (frontend).

## 📋 Funcionalidades

### 1. Cadastro de Clientes e Veículos
- ✅ Cadastro completo de clientes (nome, telefone, e-mail)
- ✅ Cadastro de veículos vinculados aos clientes (placa, modelo, ano, quilometragem)
- ✅ Busca de veículos por placa
- ✅ Listagem e edição de dados

### 2. Registro de Ordens de Serviço
- ✅ Criação de ordens de serviço vinculadas a clientes e veículos
- ✅ Registro de defeitos relatados e serviços a realizar
- ✅ Controle de status (Em andamento, Pronto, Entregue)
- ✅ Definição de valor da mão de obra

### 3. Controle de Peças Utilizadas
- ✅ Cadastro de peças com preço e estoque
- ✅ Adição de peças às ordens de serviço
- ✅ Controle automático de estoque
- ✅ Alertas de estoque baixo

### 4. Geração de Orçamento Automático
- ✅ Cálculo automático do valor total (peças + mão de obra)
- ✅ Visualização detalhada dos custos
- ✅ Atualização em tempo real

### 5. Status do Serviço
- ✅ Acompanhamento do progresso das ordens
- ✅ Mudança de status com um clique
- ✅ Filtros por status

### 6. Relatórios de Faturamento
- ✅ Faturamento mensal detalhado
- ✅ Peças mais utilizadas
- ✅ Serviços mais realizados
- ✅ Dashboard com estatísticas gerais
- ✅ Exportação de relatórios

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Flask-CORS** - Suporte a CORS

### Frontend
- **React** - Biblioteca JavaScript
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Ícones
- **Axios** - Cliente HTTP
- **React Router** - Roteamento

## 📁 Estrutura do Projeto

```
sistema_oficina/
├── backend/
│   └── oficina_api/
│       ├── src/
│       │   ├── models/
│       │   │   └── oficina_models.py
│       │   ├── routes/
│       │   │   ├── clientes.py
│       │   │   ├── veiculos.py
│       │   │   ├── ordens_servico.py
│       │   │   ├── pecas.py
│       │   │   └── relatorios.py
│       │   ├── static/          # Frontend buildado
│       │   └── main.py
│       ├── venv/
│       └── requirements.txt
└── frontend/
    └── oficina-frontend/
        ├── src/
        │   ├── components/
        │   │   ├── Dashboard.jsx
        │   │   ├── Clientes.jsx
        │   │   ├── Veiculos.jsx
        │   │   ├── OrdensServico.jsx
        │   │   ├── Pecas.jsx
        │   │   └── Relatorios.jsx
        │   ├── services/
        │   │   └── api.js
        │   └── App.jsx
        └── dist/               # Build de produção
```

## 🗄️ Modelos de Dados

### Cliente
- ID, Nome, Telefone, E-mail

### Veículo
- ID, Placa, Modelo, Ano, Quilometragem, Cliente ID

### Ordem de Serviço
- ID, Data de Entrada, Defeito Relatado, Serviços a Realizar
- Status, Valor Mão de Obra, Valor Total, Cliente ID, Veículo ID

### Peça
- ID, Nome, Preço Unitário, Estoque

### Peça Utilizada
- ID, Quantidade, Preço Total, Ordem de Serviço ID, Peça ID

## 🔗 API Endpoints

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/{id}` - Atualizar cliente
- `DELETE /api/clientes/{id}` - Excluir cliente

### Veículos
- `GET /api/veiculos` - Listar veículos
- `GET /api/veiculos/cliente/{id}` - Veículos por cliente
- `GET /api/veiculos/buscar/{placa}` - Buscar por placa
- `POST /api/veiculos` - Criar veículo

### Ordens de Serviço
- `GET /api/ordens_servico` - Listar ordens
- `POST /api/ordens_servico` - Criar ordem
- `PUT /api/ordens_servico/{id}/status` - Atualizar status
- `GET /api/ordens_servico/{id}/orcamento` - Gerar orçamento

### Peças
- `GET /api/pecas` - Listar peças
- `POST /api/pecas` - Criar peça
- `POST /api/ordens_servico/{id}/pecas` - Adicionar peça à ordem

### Relatórios
- `GET /api/relatorios/dashboard` - Dashboard
- `GET /api/relatorios/faturamento_mensal` - Faturamento mensal
- `GET /api/relatorios/pecas_mais_usadas` - Peças mais usadas
- `GET /api/relatorios/servicos_mais_realizados` - Serviços mais realizados

## 🚀 Como Usar


1. **Cadastre clientes:** Vá em "Clientes" e adicione os dados dos clientes

2. **Cadastre veículos:** Em "Veículos", adicione os carros dos clientes

3. **Cadastre peças:** Em "Peças", adicione as peças do estoque

4. **Crie ordens de serviço:** Em "Ordens de Serviço", registre os serviços

5. **Acompanhe relatórios:** Em "Relatórios", veja estatísticas e faturamento

## 💡 Exemplo de Uso Prático

### Cenário: Cliente leva carro para troca de óleo

1. **Cliente chega:** Busque pela placa ou nome no sistema
2. **Crie ordem de serviço:** 
   - Defeito: "Óleo vencido"
   - Serviços: "Troca de óleo e filtro"
   - Status: "Em andamento"
3. **Adicione peças:** 4 litros de óleo + 1 filtro
4. **Defina mão de obra:** R$ 50,00
5. **Gere orçamento:** Sistema calcula automaticamente
6. **Atualize status:** "Pronto" → "Entregue"
7. **Veja relatórios:** Faturamento atualizado automaticamente

## 🔧 Desenvolvimento Local

### Backend
```bash
cd sistema_oficina/backend/oficina_api
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

### Frontend
```bash
cd sistema_oficina/frontend/oficina-frontend
pnpm install
pnpm run dev
```

## 📊 Recursos Avançados

- **Dashboard em tempo real** com estatísticas
- **Controle de estoque** com alertas automáticos
- **Filtros avançados** por status, período, etc.
- **Exportação de relatórios** em JSON
- **Interface responsiva** para desktop e mobile
- **Validações** de dados em frontend e backend
- **Relacionamentos** automáticos entre entidades

## 🎯 Benefícios para a Oficina

1. **Organização:** Todos os dados centralizados
2. **Eficiência:** Busca rápida por placa ou cliente
3. **Controle:** Acompanhamento de status em tempo real
4. **Financeiro:** Relatórios de faturamento automáticos
5. **Estoque:** Controle de peças com alertas
6. **Histórico:** Registro completo de serviços por veículo



