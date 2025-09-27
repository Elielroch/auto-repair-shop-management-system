from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from src.models.oficina_models import db, OrdemServico, PecaUtilizada, Peca

relatorios_bp = Blueprint('relatorios', __name__)

@relatorios_bp.route('/relatorios/faturamento_mensal', methods=['GET'])
def faturamento_mensal():
    try:
        # Parâmetros opcionais para ano e mês
        ano = request.args.get('ano', datetime.now().year, type=int)
        mes = request.args.get('mes', datetime.now().month, type=int)
        
        # Consultar ordens de serviço do mês/ano especificado
        ordens = db.session.query(OrdemServico).filter(
            extract('year', OrdemServico.data_entrada) == ano,
            extract('month', OrdemServico.data_entrada) == mes,
            OrdemServico.status == 'Entregue'  # Apenas ordens entregues
        ).all()
        
        total_faturamento = sum(ordem.valor_total for ordem in ordens)
        total_ordens = len(ordens)
        
        # Faturamento por dia do mês
        faturamento_diario = {}
        for ordem in ordens:
            dia = ordem.data_entrada.day
            if dia not in faturamento_diario:
                faturamento_diario[dia] = {'valor': 0, 'ordens': 0}
            faturamento_diario[dia]['valor'] += ordem.valor_total
            faturamento_diario[dia]['ordens'] += 1
        
        relatorio = {
            'ano': ano,
            'mes': mes,
            'total_faturamento': total_faturamento,
            'total_ordens': total_ordens,
            'faturamento_diario': faturamento_diario,
            'ordens_detalhadas': [ordem.to_dict() for ordem in ordens]
        }
        
        return jsonify(relatorio), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relatorios_bp.route('/relatorios/pecas_mais_usadas', methods=['GET'])
def pecas_mais_usadas():
    try:
        # Parâmetros opcionais para período
        dias = request.args.get('dias', 30, type=int)  # Últimos 30 dias por padrão
        data_limite = datetime.now().date() - timedelta(days=dias)
        
        # Consultar peças mais utilizadas
        pecas_utilizadas = db.session.query(
            Peca.nome,
            func.sum(PecaUtilizada.quantidade).label('total_quantidade'),
            func.sum(PecaUtilizada.preco_total).label('total_valor'),
            func.count(PecaUtilizada.id).label('total_usos')
        ).join(
            PecaUtilizada, Peca.id == PecaUtilizada.peca_id
        ).join(
            OrdemServico, PecaUtilizada.ordem_servico_id == OrdemServico.id
        ).filter(
            OrdemServico.data_entrada >= data_limite
        ).group_by(
            Peca.id, Peca.nome
        ).order_by(
            func.sum(PecaUtilizada.quantidade).desc()
        ).limit(10).all()
        
        relatorio = {
            'periodo_dias': dias,
            'data_inicio': data_limite.isoformat(),
            'pecas_mais_usadas': [
                {
                    'nome': peca.nome,
                    'total_quantidade': peca.total_quantidade,
                    'total_valor': float(peca.total_valor),
                    'total_usos': peca.total_usos
                }
                for peca in pecas_utilizadas
            ]
        }
        
        return jsonify(relatorio), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relatorios_bp.route('/relatorios/servicos_mais_realizados', methods=['GET'])
def servicos_mais_realizados():
    try:
        # Parâmetros opcionais para período
        dias = request.args.get('dias', 30, type=int)  # Últimos 30 dias por padrão
        data_limite = datetime.now().date() - timedelta(days=dias)
        
        # Consultar ordens de serviço do período
        ordens = db.session.query(OrdemServico).filter(
            OrdemServico.data_entrada >= data_limite,
            OrdemServico.status == 'Entregue'
        ).all()
        
        # Contar serviços (baseado no campo servicos_a_realizar)
        servicos_count = {}
        for ordem in ordens:
            if ordem.servicos_a_realizar:
                # Dividir por vírgula ou ponto e vírgula para contar serviços individuais
                servicos = [s.strip() for s in ordem.servicos_a_realizar.replace(';', ',').split(',')]
                for servico in servicos:
                    if servico:
                        servico_lower = servico.lower()
                        if servico_lower not in servicos_count:
                            servicos_count[servico_lower] = {'nome': servico, 'quantidade': 0, 'valor_total': 0}
                        servicos_count[servico_lower]['quantidade'] += 1
                        servicos_count[servico_lower]['valor_total'] += ordem.valor_total
        
        # Ordenar por quantidade
        servicos_ordenados = sorted(
            servicos_count.values(),
            key=lambda x: x['quantidade'],
            reverse=True
        )[:10]  # Top 10
        
        relatorio = {
            'periodo_dias': dias,
            'data_inicio': data_limite.isoformat(),
            'total_ordens_periodo': len(ordens),
            'servicos_mais_realizados': servicos_ordenados
        }
        
        return jsonify(relatorio), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@relatorios_bp.route('/relatorios/dashboard', methods=['GET'])
def dashboard():
    try:
        # Estatísticas gerais
        total_clientes = db.session.query(func.count(db.distinct(OrdemServico.cliente_id))).scalar()
        total_veiculos = db.session.query(func.count(db.distinct(OrdemServico.veiculo_id))).scalar()
        
        # Ordens por status
        ordens_em_andamento = OrdemServico.query.filter_by(status='Em andamento').count()
        ordens_prontas = OrdemServico.query.filter_by(status='Pronto').count()
        ordens_entregues = OrdemServico.query.filter_by(status='Entregue').count()
        
        # Faturamento do mês atual
        mes_atual = datetime.now().month
        ano_atual = datetime.now().year
        
        faturamento_mes = db.session.query(func.sum(OrdemServico.valor_total)).filter(
            extract('year', OrdemServico.data_entrada) == ano_atual,
            extract('month', OrdemServico.data_entrada) == mes_atual,
            OrdemServico.status == 'Entregue'
        ).scalar() or 0
        
        # Ordens do mês
        ordens_mes = db.session.query(func.count(OrdemServico.id)).filter(
            extract('year', OrdemServico.data_entrada) == ano_atual,
            extract('month', OrdemServico.data_entrada) == mes_atual
        ).scalar() or 0
        
        dashboard_data = {
            'estatisticas_gerais': {
                'total_clientes_ativos': total_clientes,
                'total_veiculos_ativos': total_veiculos,
                'ordens_em_andamento': ordens_em_andamento,
                'ordens_prontas': ordens_prontas,
                'ordens_entregues': ordens_entregues
            },
            'faturamento_mes_atual': {
                'mes': mes_atual,
                'ano': ano_atual,
                'valor_total': float(faturamento_mes),
                'total_ordens': ordens_mes
            }
        }
        
        return jsonify(dashboard_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

