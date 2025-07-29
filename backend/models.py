from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, TIMESTAMP, Numeric, Boolean, BigInteger, Double
from sqlalchemy.orm import relationship
from .database import Base

class Unit(Base):
    __tablename__ = "newtab_lotes"

    codigo_lote = Column(Integer, primary_key=True, index=True)
    nome_lote = Column(String)
    codinome01 = Column(String)
    codinome02 = Column(String)
    codinome03 = Column(String)
    codinome04 = Column(String)
    bills = relationship("WaterBill", back_populates="unit")
    users_lotes = relationship("UserLote", back_populates="unit") # ADICIONADO: Relação com UserLote

    def to_dict(self):
        return {
            "codigo_lote": self.codigo_lote,
            "nome_lote": self.nome_lote,
            "codinome01": self.codinome01
        }

class WaterBill(Base):
    __tablename__ = "newtab_agua_cobranca"

    id = Column(String(36), primary_key=True, index=True)
    codigo_lote = Column(Integer, ForeignKey("newtab_lotes.codigo_lote"))
    data_ref = Column(Date, nullable=False)
    data_display = Column(String(20), nullable=False)
    leitura = Column(Integer)
    mes_pct_comprado_consumido = Column(Double)
    consumo_medido_m3 = Column(Integer)
    consumo_esgoto_m3 = Column(Integer)
    consumo_produzido_m3 = Column(Integer)
    consumo_comprado_m3 = Column(Integer)
    faixa_esgoto = Column(String(255))
    tarifa_esgoto = Column(Numeric(12,2))
    deduzir_esgoto = Column(Numeric(12,2))
    total_esgoto_rs = Column(Float)
    faixa_agua = Column(String(255))
    tarifa_agua = Column(Numeric(12,2))
    deduzir_agua = Column(Numeric(12,2))
    cobrado_agua_prod_rs = Column(Float)
    preco_m3_comprado_rs = Column(Numeric(12,2))
    cobrado_agua_comp_rs = Column(Float)
    cobrado_total_agua_rs = Column(Float)
    cobrado_area_comum_rs = Column(Float)
    cobrado_outros_gastos_rs = Column(Float)
    total_conta_rs = Column(Float)
    mes_producao_agua_m3 = Column(BigInteger)
    mes_consumo_agua_m3 = Column(BigInteger)
    mes_compra_agua_m3 = Column(BigInteger)
    mes_compra_agua_rs = Column(Numeric(12,2))
    mes_cobrado_agua_prod_rs = Column(Numeric(12,2))
    unit = relationship("Unit", back_populates="bills")

    def to_dict(self):
        return {
            "id": self.id,
            "codigo_lote": self.codigo_lote,
            "data_ref": self.data_ref.isoformat() if self.data_ref else None,
            "data_display": self.data_display,
            "consumo_esgoto_m3": self.consumo_esgoto_m3,
            "total_esgoto_rs": self.total_esgoto_rs,
            "consumo_produzido_m3": self.consumo_produzido_m3,
            "consumo_comprado_m3": self.consumo_comprado_m3,
            "cobrado_total_agua_rs": self.cobrado_total_agua_rs,
            "cobrado_area_comum_rs": self.cobrado_area_comum_rs,
            "cobrado_outros_gastos_rs": self.cobrado_outros_gastos_rs,
            "total_conta_rs": self.total_conta_rs
        }

class Production(Base):
    __tablename__ = "newtab_producao"

    id = Column(BigInteger, primary_key=True)
    data_ref = Column(TIMESTAMP)
    data_leitura = Column(TIMESTAMP)
    mes_producao_agua_m3 = Column(BigInteger)
    mes_consumo_agua_m3 = Column(BigInteger)
    mes_compra_agua_m3 = Column(BigInteger)
    mes_compra_agua_rs = Column(Numeric(12,2))
    preco_m3_comprado = Column(Numeric(12,2))
    mes_area_comum_rs = Column(Numeric(12,2))
    mes_outros_gastos_rs = Column(Numeric(12,2))
    mes_cobrado_esgoto_rs = Column(Numeric(12,2))
    mes_cobrado_agua_prod_rs = Column(Numeric(12,2))
    mes_cobrado_agua_comprada_rs = Column(Numeric(12,2))
    mes_cobrado_area_comum_rs = Column(Numeric(12,2))
    mes_cobrado_outros_gastos_rs = Column(Numeric(12,2))
    pct_comprado_total2 = Column(Double)
    pct_comprado_total = Column(Float)

    def to_dict(self):
        return {
            "id": self.id,
            "data_ref": self.data_ref.isoformat() if self.data_ref else None,
            "mes_producao_agua_m3": self.mes_producao_agua_m3,
            "mes_consumo_agua_m3": self.mes_consumo_agua_m3,
            "mes_compra_agua_m3": self.mes_compra_agua_m3,
            "mes_compra_agua_rs": float(self.mes_compra_agua_rs) if self.mes_compra_agua_rs else 0.0,
            "mes_area_comum_rs": float(self.mes_area_comum_rs) if self.mes_area_comum_rs else 0.0,
            "mes_outros_gastos_rs": float(self.mes_outros_gastos_rs) if self.mes_outros_gastos_rs else 0.0,
            "mes_cobrado_esgoto_rs": float(self.mes_cobrado_esgoto_rs) if self.mes_cobrado_esgoto_rs else 0.0,
            "mes_cobrado_agua_prod_rs": float(self.mes_cobrado_agua_prod_rs) if self.mes_cobrado_agua_prod_rs else 0.0,
            "mes_cobrado_agua_comprada_rs": float(self.mes_cobrado_agua_comprada_rs) if self.mes_cobrado_agua_comprada_rs else 0.0,
            "mes_cobrado_area_comum_rs": float(self.mes_cobrado_area_comum_rs) if self.mes_cobrado_area_comum_rs else 0.0,
            "mes_cobrado_outros_gastos_rs": float(self.mes_cobrado_outros_gastos_rs) if self.mes_cobrado_outros_gastos_rs else 0.0,
            "pct_comprado_total2": self.pct_comprado_total2,
            "pct_comprado_total": self.pct_comprado_total
        }

class User(Base):
    __tablename__ = "newtab_usuarios" # Nome da tabela de usuários

    id = Column(BigInteger, primary_key=True, autoincrement=True) # `generated by default as identity` no SQL
    nome_usuario = Column(String(80), nullable=False)
    email_usuario = Column(String(80), unique=True, nullable=False, index=True)
    senha_usuario = Column(String(255), nullable=False) # Armazenará o hash da senha
    perfil_usuario = Column(String(80), nullable=False, default='user') # Ex: 'admin', 'user'
    lotes = relationship("UserLote", back_populates="user") # ADICIONADO: Relação com UserLote

    def to_dict(self):
        return {
            "id": self.id,
            "nome_usuario": self.nome_usuario,
            "email_usuario": self.email_usuario,
            "perfil_usuario": self.perfil_usuario
            # NUNCA inclua a senha no dicionário retornado para o frontend
        }

class UserLote(Base): # NOVO MODELO
    __tablename__ = "newtab_usuarios_lotes"

    user_id = Column(BigInteger, ForeignKey("newtab_usuarios.id"), primary_key=True)
    codigo_lote = Column(Integer, ForeignKey("newtab_lotes.codigo_lote"), primary_key=True)

    user = relationship("User", back_populates="lotes")
    unit = relationship("Unit", back_populates="users_lotes")
