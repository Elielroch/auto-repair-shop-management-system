from flask import Blueprint, request, jsonify
from src.models.oficina_models import db, Veiculo, Cliente

veiculos_bp = Blueprint('veiculos', __name__)

@veiculos_bp.route('/veiculos', methods=['GET'])
def listar_veiculos():
    try:
        veiculos = Veiculo.query.all()
        return jsonify([veiculo.to_dict() for veiculo in veiculos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@veiculos_bp.route('/veiculos/<int:id>', methods=['GET'])
def obter_veiculo(id):
    try:
        veiculo = Veiculo.query.get_or_404(id)
        return jsonify(veiculo.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@veiculos_bp.route('/veiculos/cliente/<int:cliente_id>', methods=['GET'])
def listar_veiculos_cliente(cliente_id):
    try:
        cliente = Cliente.query.get_or_404(cliente_id)
        veiculos = Veiculo.query.filter_by(cliente_id=cliente_id).all()
        return jsonify([veiculo.to_dict() for veiculo in veiculos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@veiculos_bp.route('/veiculos/buscar/<string:placa>', methods=['GET'])
def buscar_veiculo_por_placa(placa):
    try:
        veiculo = Veiculo.query.filter_by(placa=placa.upper()).first()
        if not veiculo:
            return jsonify({'error': 'Veículo não encontrado'}), 404
        return jsonify(veiculo.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@veiculos_bp.route('/veiculos', methods=['POST'])
def criar_veiculo():
    try:
        data = request.get_json()
        
        if not data or not data.get('placa') or not data.get('cliente_id'):
            return jsonify({'error': 'Placa e cliente_id são obrigatórios'}), 400
        
        # Verificar se o cliente existe
        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        # Verificar se a placa já existe
        placa_upper = data['placa'].upper()
        veiculo_existente = Veiculo.query.filter_by(placa=placa_upper).first()
        if veiculo_existente:
            return jsonify({'error': 'Placa já cadastrada'}), 400
        
        veiculo = Veiculo(
            placa=placa_upper,
            modelo=data.get('modelo'),
            ano=data.get('ano'),
            quilometragem=data.get('quilometragem'),
            cliente_id=data['cliente_id']
        )
        
        db.session.add(veiculo)
        db.session.commit()
        
        return jsonify(veiculo.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@veiculos_bp.route('/veiculos/<int:id>', methods=['PUT'])
def atualizar_veiculo(id):
    try:
        veiculo = Veiculo.query.get_or_404(id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Se a placa for alterada, verificar se não existe outra igual
        if 'placa' in data and data['placa'].upper() != veiculo.placa:
            placa_upper = data['placa'].upper()
            veiculo_existente = Veiculo.query.filter_by(placa=placa_upper).first()
            if veiculo_existente:
                return jsonify({'error': 'Placa já cadastrada'}), 400
            veiculo.placa = placa_upper
        
        veiculo.modelo = data.get('modelo', veiculo.modelo)
        veiculo.ano = data.get('ano', veiculo.ano)
        veiculo.quilometragem = data.get('quilometragem', veiculo.quilometragem)
        
        if 'cliente_id' in data:
            cliente = Cliente.query.get(data['cliente_id'])
            if not cliente:
                return jsonify({'error': 'Cliente não encontrado'}), 404
            veiculo.cliente_id = data['cliente_id']
        
        db.session.commit()
        
        return jsonify(veiculo.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@veiculos_bp.route('/veiculos/<int:id>', methods=['DELETE'])
def excluir_veiculo(id):
    try:
        veiculo = Veiculo.query.get_or_404(id)
        
        # Verificar se o veículo tem ordens de serviço
        if veiculo.ordens_servico:
            return jsonify({'error': 'Não é possível excluir veículo com ordens de serviço associadas'}), 400
        
        db.session.delete(veiculo)
        db.session.commit()
        
        return jsonify({'message': 'Veículo excluído com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

