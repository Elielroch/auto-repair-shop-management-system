from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models.oficina_models import db, OrdemServico, Cliente, Veiculo, PecaUtilizada

ordens_servico_bp = Blueprint('ordens_servico', __name__)

@ordens_servico_bp.route('/ordens_servico', methods=['GET'])
def listar_ordens_servico():
    try:
        status_filter = request.args.get('status')
        if status_filter:
            ordens = OrdemServico.query.filter_by(status=status_filter).all()
        else:
            ordens = OrdemServico.query.all()
        
        return jsonify([ordem.to_dict() for ordem in ordens]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ordens_servico_bp.route('/ordens_servico/<int:id>', methods=['GET'])
def obter_ordem_servico(id):
    try:
        ordem = OrdemServico.query.get_or_404(id)
        ordem_dict = ordem.to_dict()
        
        # Incluir peças utilizadas
        ordem_dict['pecas_utilizadas'] = [peca.to_dict() for peca in ordem.pecas_utilizadas]
        
        return jsonify(ordem_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ordens_servico_bp.route('/ordens_servico', methods=['POST'])
def criar_ordem_servico():
    try:
        data = request.get_json()
        
        if not data or not data.get('cliente_id') or not data.get('veiculo_id'):
            return jsonify({'error': 'cliente_id e veiculo_id são obrigatórios'}), 400
        
        # Verificar se cliente e veículo existem
        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        veiculo = Veiculo.query.get(data['veiculo_id'])
        if not veiculo:
            return jsonify({'error': 'Veículo não encontrado'}), 404
        
        # Verificar se o veículo pertence ao cliente
        if veiculo.cliente_id != data['cliente_id']:
            return jsonify({'error': 'Veículo não pertence ao cliente informado'}), 400
        
        # Converter data se fornecida
        data_entrada = datetime.utcnow().date()
        if data.get('data_entrada'):
            try:
                data_entrada = datetime.strptime(data['data_entrada'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        ordem = OrdemServico(
            data_entrada=data_entrada,
            defeito_relatado=data.get('defeito_relatado'),
            servicos_a_realizar=data.get('servicos_a_realizar'),
            status=data.get('status', 'Em andamento'),
            valor_mao_obra=data.get('valor_mao_obra', 0.0),
            cliente_id=data['cliente_id'],
            veiculo_id=data['veiculo_id']
        )
        
        db.session.add(ordem)
        db.session.commit()
        
        return jsonify(ordem.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ordens_servico_bp.route('/ordens_servico/<int:id>', methods=['PUT'])
def atualizar_ordem_servico(id):
    try:
        ordem = OrdemServico.query.get_or_404(id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Atualizar campos se fornecidos
        if 'data_entrada' in data:
            try:
                ordem.data_entrada = datetime.strptime(data['data_entrada'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        ordem.defeito_relatado = data.get('defeito_relatado', ordem.defeito_relatado)
        ordem.servicos_a_realizar = data.get('servicos_a_realizar', ordem.servicos_a_realizar)
        ordem.status = data.get('status', ordem.status)
        ordem.valor_mao_obra = data.get('valor_mao_obra', ordem.valor_mao_obra)
        
        # Recalcular valor total se necessário
        if 'valor_mao_obra' in data:
            valor_pecas = sum(peca.preco_total for peca in ordem.pecas_utilizadas)
            ordem.valor_total = ordem.valor_mao_obra + valor_pecas
        
        db.session.commit()
        
        return jsonify(ordem.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ordens_servico_bp.route('/ordens_servico/<int:id>/status', methods=['PUT'])
def atualizar_status_ordem_servico(id):
    try:
        ordem = OrdemServico.query.get_or_404(id)
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({'error': 'Status é obrigatório'}), 400
        
        status_validos = ['Em andamento', 'Pronto', 'Entregue']
        if data['status'] not in status_validos:
            return jsonify({'error': f'Status deve ser um dos seguintes: {", ".join(status_validos)}'}), 400
        
        ordem.status = data['status']
        db.session.commit()
        
        return jsonify(ordem.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ordens_servico_bp.route('/ordens_servico/<int:id>', methods=['DELETE'])
def excluir_ordem_servico(id):
    try:
        ordem = OrdemServico.query.get_or_404(id)
        
        # As peças utilizadas serão excluídas automaticamente devido ao cascade
        db.session.delete(ordem)
        db.session.commit()
        
        return jsonify({'message': 'Ordem de serviço excluída com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ordens_servico_bp.route('/ordens_servico/<int:id>/orcamento', methods=['GET'])
def gerar_orcamento(id):
    try:
        ordem = OrdemServico.query.get_or_404(id)
        
        # Calcular valor das peças
        valor_pecas = sum(peca.preco_total for peca in ordem.pecas_utilizadas)
        valor_total = ordem.valor_mao_obra + valor_pecas
        
        # Atualizar valor total na ordem
        ordem.valor_total = valor_total
        db.session.commit()
        
        orcamento = {
            'ordem_servico_id': ordem.id,
            'cliente_nome': ordem.cliente.nome,
            'veiculo_placa': ordem.veiculo.placa,
            'data_entrada': ordem.data_entrada.isoformat(),
            'servicos_a_realizar': ordem.servicos_a_realizar,
            'valor_mao_obra': ordem.valor_mao_obra,
            'valor_pecas': valor_pecas,
            'valor_total': valor_total,
            'pecas_utilizadas': [peca.to_dict() for peca in ordem.pecas_utilizadas]
        }
        
        return jsonify(orcamento), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

