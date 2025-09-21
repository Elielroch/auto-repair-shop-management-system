from flask import Blueprint, request, jsonify
from src.models.oficina_models import db, Cliente, Veiculo

clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route('/clientes', methods=['GET'])
def listar_clientes():
    try:
        clientes = Cliente.query.all()
        return jsonify([cliente.to_dict() for cliente in clientes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@clientes_bp.route('/clientes/<int:id>', methods=['GET'])
def obter_cliente(id):
    try:
        cliente = Cliente.query.get_or_404(id)
        cliente_dict = cliente.to_dict()
        # Incluir veículos do cliente
        cliente_dict['veiculos'] = [veiculo.to_dict() for veiculo in cliente.veiculos]
        return jsonify(cliente_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@clientes_bp.route('/clientes', methods=['POST'])
def criar_cliente():
    try:
        data = request.get_json()
        
        if not data or not data.get('nome'):
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        cliente = Cliente(
            nome=data['nome'],
            telefone=data.get('telefone'),
            email=data.get('email')
        )
        
        db.session.add(cliente)
        db.session.commit()
        
        return jsonify(cliente.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@clientes_bp.route('/clientes/<int:id>', methods=['PUT'])
def atualizar_cliente(id):
    try:
        cliente = Cliente.query.get_or_404(id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        cliente.nome = data.get('nome', cliente.nome)
        cliente.telefone = data.get('telefone', cliente.telefone)
        cliente.email = data.get('email', cliente.email)
        
        db.session.commit()
        
        return jsonify(cliente.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@clientes_bp.route('/clientes/<int:id>', methods=['DELETE'])
def excluir_cliente(id):
    try:
        cliente = Cliente.query.get_or_404(id)
        
        # Verificar se o cliente tem veículos ou ordens de serviço
        if cliente.veiculos or cliente.ordens_servico:
            return jsonify({'error': 'Não é possível excluir cliente com veículos ou ordens de serviço associadas'}), 400
        
        db.session.delete(cliente)
        db.session.commit()
        
        return jsonify({'message': 'Cliente excluído com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

