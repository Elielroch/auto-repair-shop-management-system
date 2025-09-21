from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(120))

    veiculos = db.relationship('Veiculo', back_populates='cliente', lazy=True)
    ordens_servico = db.relationship('OrdemServico', back_populates='cliente', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'telefone': self.telefone,
            'email': self.email
        }

    def __repr__(self):
        return f"<Cliente(nome='{self.nome}', telefone='{self.telefone}')>"

class Veiculo(db.Model):
    __tablename__ = 'veiculos'
    id = db.Column(db.Integer, primary_key=True)
    placa = db.Column(db.String(10), unique=True, nullable=False)
    modelo = db.Column(db.String(50))
    ano = db.Column(db.Integer)
    quilometragem = db.Column(db.Integer)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)

    cliente = db.relationship('Cliente', back_populates='veiculos')
    ordens_servico = db.relationship('OrdemServico', back_populates='veiculo', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'placa': self.placa,
            'modelo': self.modelo,
            'ano': self.ano,
            'quilometragem': self.quilometragem,
            'cliente_id': self.cliente_id,
            'cliente_nome': self.cliente.nome if self.cliente else None
        }

    def __repr__(self):
        return f"<Veiculo(placa='{self.placa}', modelo='{self.modelo}')>"

class OrdemServico(db.Model):
    __tablename__ = 'ordens_servico'
    id = db.Column(db.Integer, primary_key=True)
    data_entrada = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    defeito_relatado = db.Column(db.Text)
    servicos_a_realizar = db.Column(db.Text)
    status = db.Column(db.String(20), default='Em andamento')  # Em andamento, Pronto, Entregue
    valor_total = db.Column(db.Float, default=0.0)
    valor_mao_obra = db.Column(db.Float, default=0.0)

    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculos.id'), nullable=False)

    cliente = db.relationship('Cliente', back_populates='ordens_servico')
    veiculo = db.relationship('Veiculo', back_populates='ordens_servico')
    pecas_utilizadas = db.relationship('PecaUtilizada', back_populates='ordem_servico', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'data_entrada': self.data_entrada.isoformat() if self.data_entrada else None,
            'defeito_relatado': self.defeito_relatado,
            'servicos_a_realizar': self.servicos_a_realizar,
            'status': self.status,
            'valor_total': self.valor_total,
            'valor_mao_obra': self.valor_mao_obra,
            'cliente_id': self.cliente_id,
            'veiculo_id': self.veiculo_id,
            'cliente_nome': self.cliente.nome if self.cliente else None,
            'veiculo_placa': self.veiculo.placa if self.veiculo else None
        }

    def __repr__(self):
        return f"<OrdemServico(id={self.id}, status='{self.status}')>"

class Peca(db.Model):
    __tablename__ = 'pecas'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    preco_unitario = db.Column(db.Float, nullable=False)
    estoque = db.Column(db.Integer, nullable=False, default=0)

    pecas_utilizadas = db.relationship('PecaUtilizada', back_populates='peca', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'preco_unitario': self.preco_unitario,
            'estoque': self.estoque
        }

    def __repr__(self):
        return f"<Peca(nome='{self.nome}', estoque={self.estoque})>"

class PecaUtilizada(db.Model):
    __tablename__ = 'pecas_utilizadas'
    id = db.Column(db.Integer, primary_key=True)
    quantidade = db.Column(db.Integer, nullable=False)
    preco_total = db.Column(db.Float, nullable=False)

    ordem_servico_id = db.Column(db.Integer, db.ForeignKey('ordens_servico.id'), nullable=False)
    peca_id = db.Column(db.Integer, db.ForeignKey('pecas.id'), nullable=False)

    ordem_servico = db.relationship('OrdemServico', back_populates='pecas_utilizadas')
    peca = db.relationship('Peca', back_populates='pecas_utilizadas')

    def to_dict(self):
        return {
            'id': self.id,
            'quantidade': self.quantidade,
            'preco_total': self.preco_total,
            'ordem_servico_id': self.ordem_servico_id,
            'peca_id': self.peca_id,
            'peca_nome': self.peca.nome if self.peca else None,
            'preco_unitario': self.peca.preco_unitario if self.peca else None
        }

    def __repr__(self):
        return f"<PecaUtilizada(peca='{self.peca.nome if self.peca else 'N/A'}', quantidade={self.quantidade})>"

