from flask import Blueprint, request, jsonify
from src.models.oficina_models import db, Peca, PecaUtilizada, OrdemServico

pecas_bp = Blueprint('pecas', __name__)

# CRUD de Peças
@pecas_bp.route('/pecas', methods=['GET'])
def listar_pecas():
    try:
        pecas = Peca.query.all()
        return jsonify([peca.to_dict() for peca in pecas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pecas_bp.route('/pecas/<int:id>', methods=['GET'])
def obter_peca(id):
    try:
        peca = Peca.query.get_or_404(id)
        return jsonify(peca.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pecas_bp.route('/pecas', methods=['POST'])
def criar_peca():
    try:
        data = request.get_json()
        
        if not data or not data.get('nome') or not data.get('preco_unitario'):
            return jsonify({'error': 'Nome e preço unitário são obrigatórios'}), 400
        
        # Verificar se a peça já existe
        peca_existente = Peca.query.filter_by(nome=data['nome']).first()
        if peca_existente:
            return jsonify({'error': 'Peça já cadastrada'}), 400
        
        peca = Peca(
            nome=data['nome'],
            preco_unitario=data['preco_unitario'],
            estoque=data.get('estoque', 0)
        )
        
        db.session.add(peca)
        db.session.commit()
        
        return jsonify(peca.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pecas_bp.route('/pecas/<int:id>', methods=['PUT'])
def atualizar_peca(id):
    try:
        peca = Peca.query.get_or_404(id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Verificar se o nome não conflita com outra peça
        if 'nome' in data and data['nome'] != peca.nome:
            peca_existente = Peca.query.filter_by(nome=data['nome']).first()
            if peca_existente:
                return jsonify({'error': 'Nome de peça já existe'}), 400
            peca.nome = data['nome']
        
        peca.preco_unitario = data.get('preco_unitario', peca.preco_unitario)
        peca.estoque = data.get('estoque', peca.estoque)
        
        db.session.commit()
        
        return jsonify(peca.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pecas_bp.route('/pecas/<int:id>', methods=['DELETE'])
def excluir_peca(id):
    try:
        peca = Peca.query.get_or_404(id)
        
        # Verificar se a peça foi utilizada em alguma ordem de serviço
        if peca.pecas_utilizadas:
            return jsonify({'error': 'Não é possível excluir peça que já foi utilizada em ordens de serviço'}), 400
        
        db.session.delete(peca)
        db.session.commit()
        
        return jsonify({'message': 'Peça excluída com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Peças Utilizadas em Ordens de Serviço
@pecas_bp.route('/ordens_servico/<int:os_id>/pecas', methods=['POST'])
def adicionar_peca_ordem_servico(os_id):
    try:
        ordem = OrdemServico.query.get_or_404(os_id)
        data = request.get_json()
        
        if not data or not data.get('peca_id') or not data.get('quantidade'):
            return jsonify({'error': 'peca_id e quantidade são obrigatórios'}), 400
        
        peca = Peca.query.get(data['peca_id'])
        if not peca:
            return jsonify({'error': 'Peça não encontrada'}), 404
        
        quantidade = data['quantidade']
        
        # Verificar se há estoque suficiente
        if peca.estoque < quantidade:
            return jsonify({'error': f'Estoque insuficiente. Disponível: {peca.estoque}'}), 400
        
        # Calcular preço total
        preco_total = peca.preco_unitario * quantidade
        
        # Criar peça utilizada
        peca_utilizada = PecaUtilizada(
            quantidade=quantidade,
            preco_total=preco_total,
            ordem_servico_id=os_id,
            peca_id=data['peca_id']
        )
        
        # Atualizar estoque
        peca.estoque -= quantidade
        
        # Atualizar valor total da ordem de serviço
        ordem.valor_total = ordem.valor_mao_obra + sum(pu.preco_total for pu in ordem.pecas_utilizadas) + preco_total
        
        db.session.add(peca_utilizada)
        db.session.commit()
        
        return jsonify(peca_utilizada.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pecas_bp.route('/ordens_servico/<int:os_id>/pecas/<int:peca_utilizada_id>', methods=['DELETE'])
def remover_peca_ordem_servico(os_id, peca_utilizada_id):
    try:
        ordem = OrdemServico.query.get_or_404(os_id)
        peca_utilizada = PecaUtilizada.query.get_or_404(peca_utilizada_id)
        
        # Verificar se a peça utilizada pertence à ordem de serviço
        if peca_utilizada.ordem_servico_id != os_id:
            return jsonify({'error': 'Peça utilizada não pertence a esta ordem de serviço'}), 400
        
        # Devolver ao estoque
        peca = peca_utilizada.peca
        peca.estoque += peca_utilizada.quantidade
        
        # Atualizar valor total da ordem de serviço
        ordem.valor_total -= peca_utilizada.preco_total
        
        db.session.delete(peca_utilizada)
        db.session.commit()
        
        return jsonify({'message': 'Peça removida da ordem de serviço com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pecas_bp.route('/ordens_servico/<int:os_id>/pecas', methods=['GET'])
def listar_pecas_ordem_servico(os_id):
    try:
        ordem = OrdemServico.query.get_or_404(os_id)
        pecas_utilizadas = PecaUtilizada.query.filter_by(ordem_servico_id=os_id).all()
        return jsonify([peca.to_dict() for peca in pecas_utilizadas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

