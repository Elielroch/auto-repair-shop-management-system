# Esboço das Rotas da API

## Clientes
- `GET /clientes`: Listar todos os clientes
- `GET /clientes/<id>`: Obter detalhes de um cliente específico
- `POST /clientes`: Criar um novo cliente
- `PUT /clientes/<id>`: Atualizar um cliente existente
- `DELETE /clientes/<id>`: Excluir um cliente

## Veículos
- `GET /veiculos`: Listar todos os veículos
- `GET /veiculos/<id>`: Obter detalhes de um veículo específico
- `GET /veiculos/cliente/<cliente_id>`: Listar veículos de um cliente
- `POST /veiculos`: Criar um novo veículo
- `PUT /veiculos/<id>`: Atualizar um veículo existente
- `DELETE /veiculos/<id>`: Excluir um veículo

## Ordens de Serviço
- `GET /ordens_servico`: Listar todas as ordens de serviço
- `GET /ordens_servico/<id>`: Obter detalhes de uma ordem de serviço específica
- `POST /ordens_servico`: Criar uma nova ordem de serviço
- `PUT /ordens_servico/<id>`: Atualizar uma ordem de serviço existente
- `PUT /ordens_servico/<id>/status`: Atualizar o status de uma ordem de serviço
- `DELETE /ordens_servico/<id>`: Excluir uma ordem de serviço

## Peças
- `GET /pecas`: Listar todas as peças
- `GET /pecas/<id>`: Obter detalhes de uma peça específica
- `POST /pecas`: Adicionar uma nova peça ao estoque
- `PUT /pecas/<id>`: Atualizar uma peça existente (ex: estoque, preço)
- `DELETE /pecas/<id>`: Excluir uma peça

## Peças Utilizadas (dentro de Ordem de Serviço)
- `POST /ordens_servico/<os_id>/pecas`: Adicionar peças a uma ordem de serviço
- `DELETE /ordens_servico/<os_id>/pecas/<peca_utilizada_id>`: Remover peça de uma ordem de serviço

## Orçamentos
- `GET /ordens_servico/<id>/orcamento`: Gerar orçamento para uma ordem de serviço (calculado dinamicamente)

## Relatórios
- `GET /relatorios/faturamento_mensal`: Obter faturamento mensal
- `GET /relatorios/pecas_mais_usadas`: Obter relatório de peças mais usadas
- `GET /relatorios/servicos_mais_realizados`: Obter relatório de serviços mais realizados


