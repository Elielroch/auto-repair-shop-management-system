
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

class Cliente(Base):
    __tablename__ = 'clientes'
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    telefone = Column(String)
    email = Column(String)

    veiculos = relationship('Veiculo', back_populates='cliente')
    ordens_servico = relationship('OrdemServico', back_populates='cliente')

    def __repr__(self):
        return f"<Cliente(nome='{self.nome}', telefone='{self.telefone}')>"

class Veiculo(Base):
    __tablename__ = 'veiculos'
    id = Column(Integer, primary_key=True)
    placa = Column(String, unique=True, nullable=False)
    modelo = Column(String)
    ano = Column(Integer)
    quilometragem = Column(Integer)
    cliente_id = Column(Integer, ForeignKey('clientes.id'))

    cliente = relationship('Cliente', back_populates='veiculos')
    ordens_servico = relationship('OrdemServico', back_populates='veiculo')

    def __repr__(self):
        return f"<Veiculo(placa='{self.placa}', modelo='{self.modelo}')>"

class OrdemServico(Base):
    __tablename__ = 'ordens_servico'
    id = Column(Integer, primary_key=True)
    data_entrada = Column(Date, nullable=False)
    defeito_relatado = Column(String)
    servicos_a_realizar = Column(String)
    status = Column(String, default='Em andamento') # Em andamento, Pronto, Entregue
    valor_total = Column(Float, default=0.0)

    cliente_id = Column(Integer, ForeignKey('clientes.id'))
    veiculo_id = Column(Integer, ForeignKey('veiculos.id'))

    cliente = relationship('Cliente', back_populates='ordens_servico')
    veiculo = relationship('Veiculo', back_populates='ordens_servico')
    pecas_utilizadas = relationship('PecaUtilizada', back_populates='ordem_servico')

    def __repr__(self):
        return f"<OrdemServico(id={self.id}, status='{self.status}')>"

class Peca(Base):
    __tablename__ = 'pecas'
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False, unique=True)
    preco_unitario = Column(Float, nullable=False)
    estoque = Column(Integer, nullable=False)

    pecas_utilizadas = relationship('PecaUtilizada', back_populates='peca')

    def __repr__(self):
        return f"<Peca(nome='{self.nome}', estoque={self.estoque})>"

class PecaUtilizada(Base):
    __tablename__ = 'pecas_utilizadas'
    id = Column(Integer, primary_key=True)
    quantidade = Column(Integer, nullable=False)
    preco_total = Column(Float, nullable=False)

    ordem_servico_id = Column(Integer, ForeignKey('ordens_servico.id'))
    peca_id = Column(Integer, ForeignKey('pecas.id'))

    ordem_servico = relationship('OrdemServico', back_populates='pecas_utilizadas')
    peca = relationship('Peca', back_populates='pecas_utilizadas')

    def __repr__(self):
        return f"<PecaUtilizada(peca='{self.peca.nome}', quantidade={self.quantidade})>"

# Configuração do banco de dados
DATABASE_URL = "sqlite:///./oficina.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)



