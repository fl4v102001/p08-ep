from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, TIMESTAMP, Numeric, Boolean, BigInteger, Double, func
from sqlalchemy.orm import relationship
from .database import Base

class Unit(Base):
    __tablename__ = "newtab_lotes"
    # ... (código da classe Unit sem alterações)
    codigo_lote = Column(Integer, primary_key=True, index=True)
    nome_lote = Column(String)
    codinome01 = Column(String)
    codinome02 = Column(String)
    codinome03 = Column(String)
    codinome04 = Column(String)
    bills = relationship("WaterBill", back_populates="unit")
    users_lotes = relationship("UserLote", back_populates="unit")

    def to_dict(self):
        return {
            "codigo_lote": self.codigo_lote,
            "nome_lote": self.nome_lote,
            "codinome01": self.codinome01
        }


class WaterBill(Base):
    __tablename__ = "newtab_agua_cobranca"

    # Colunas existentes
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
    
    # NOVOS CAMPOS ADICIONADOS
    data_leitura = Column(TIMESTAMP)
    mes_mensagem = Column(String, default='')
    mes_consumo_media_m3 = Column(Integer)
    mes_consumo_mediana_m3 = Column(Integer)
    media_movel_6_meses_anteriores = Column(Integer)
    media_movel_12_meses_anteriores = Column(Integer)

    mes_outros_gastos_rs = Column(Numeric(12,2), default=0.0)

    unit = relationship("Unit", back_populates="bills")

    def to_dict(self):
        return {
            "id": self.id,
            "codigo_lote": self.codigo_lote,
            "data_ref": self.data_ref.isoformat() if self.data_ref else None,
            "data_display": self.data_display,
            "leitura": self.leitura,
            "consumo_medido_m3": self.consumo_medido_m3,
            "consumo_esgoto_m3": self.consumo_esgoto_m3,
            "total_esgoto_rs": self.total_esgoto_rs,
            "consumo_produzido_m3": self.consumo_produzido_m3,
            "consumo_comprado_m3": self.consumo_comprado_m3,
            "cobrado_total_agua_rs": self.cobrado_total_agua_rs,
            "cobrado_area_comum_rs": self.cobrado_area_comum_rs,
            "cobrado_outros_gastos_rs": self.cobrado_outros_gastos_rs,
            "total_conta_rs": self.total_conta_rs,
            "faixa_esgoto": self.faixa_esgoto,
            "tarifa_esgoto": float(self.tarifa_esgoto) if self.tarifa_esgoto is not None else None,
            "deduzir_esgoto": float(self.deduzir_esgoto) if self.deduzir_esgoto is not None else None,
            "faixa_agua": self.faixa_agua,
            "tarifa_agua": float(self.tarifa_agua) if self.tarifa_agua is not None else None,
            "deduzir_agua": float(self.deduzir_agua) if self.deduzir_agua is not None else None,
            "cobrado_agua_prod_rs": self.cobrado_agua_prod_rs,
            "preco_m3_comprado_rs": float(self.preco_m3_comprado_rs) if self.preco_m3_comprado_rs is not None else None,
            "cobrado_agua_comp_rs": self.cobrado_agua_comp_rs,
            
            "data_leitura": self.data_leitura.isoformat() if self.data_leitura else None,
            "mes_mensagem": self.mes_mensagem,
            "mes_consumo_media_m3": self.mes_consumo_media_m3,
            "mes_consumo_mediana_m3": self.mes_consumo_mediana_m3,

            "media_movel_6_meses_anteriores": self.media_movel_6_meses_anteriores,
            "media_movel_12_meses_anteriores": self.media_movel_12_meses_anteriores,

            "mes_outros_gastos_rs": float(self.mes_outros_gastos_rs) if self.mes_outros_gastos_rs is not None else 0.0
        }


class TempWaterBill(Base):
    __tablename__ = "newtemp_agua_cobranca"

    # Chave primária simples para a tabela temporária
    id = Column(BigInteger, primary_key=True, autoincrement=True)

    # Campos que correspondem à tabela final 'newtab_agua_cobranca'
    # A maioria é anulável porque serão preenchidos durante o processamento no backend.
    data_ref = Column(Date, nullable=False, index=True)
    codigo_lote = Column(Integer, ForeignKey("newtab_lotes.codigo_lote"), nullable=False, index=True)
    nome_lote = Column(String)
    data_display = Column(String(20))
    leitura = Column(Integer)
    mes_pct_comprado_consumido = Column(Double)
    consumo_medido_m3 = Column(Integer)
    consumo_esgoto_m3 = Column(Integer)
    consumo_produzido_m3 = Column(Integer)
    consumo_comprado_m3 = Column(Integer)
    faixa_esgoto = Column(String(255))
    tarifa_esgoto = Column(Numeric(12, 2))
    deduzir_esgoto = Column(Numeric(12, 2))
    total_esgoto_rs = Column(Float)
    faixa_agua = Column(String(255))
    tarifa_agua = Column(Numeric(12, 2))
    deduzir_agua = Column(Numeric(12, 2))
    cobrado_agua_prod_rs = Column(Float)
    preco_m3_comprado_rs = Column(Numeric(12, 2))
    cobrado_agua_comp_rs = Column(Float)
    cobrado_total_agua_rs = Column(Float)
    cobrado_area_comum_rs = Column(Float)
    cobrado_outros_gastos_rs = Column(Float)
    total_conta_rs = Column(Float)
    mes_producao_agua_m3 = Column(BigInteger)
    mes_consumo_agua_m3 = Column(BigInteger)
    mes_compra_agua_m3 = Column(BigInteger)
    mes_compra_agua_rs = Column(Numeric(12, 2))
    mes_cobrado_agua_prod_rs = Column(Numeric(12, 2))
    data_leitura = Column(TIMESTAMP)
    mes_mensagem = Column(String, default='')
    mes_consumo_media_m3 = Column(Integer)
    mes_consumo_mediana_m3 = Column(Integer)
    media_movel_6_meses_anteriores = Column(Integer)
    media_movel_12_meses_anteriores = Column(Integer)
    mes_outros_gastos_rs = Column(Numeric(12,2), default=0.0)


class Tariff(Base):
    __tablename__ = "newtab_tarifa"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    data_vigencia = Column(TIMESTAMP(timezone=False))
    data_fim_vigencia = Column(TIMESTAMP(timezone=False))
    faixa = Column(String)
    consumo_inicial = Column(BigInteger)
    consumo_final = Column(BigInteger)
    valor_m3 = Column(Double)
    parcela_deduzir = Column(Double)
    vigente = Column(Boolean)


class Production(Base):
    __tablename__ = "newtab_producao"

    # CORRIGIDO: Adicionado primary_key=True para a coluna 'id'
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
    __tablename__ = "newtab_usuarios"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    nome_usuario = Column(String(80), nullable=False)
    email_usuario = Column(String(80), unique=True, nullable=False, index=True)
    senha_usuario = Column(String(255), nullable=False)
    perfil_usuario = Column(String(80), nullable=False, default='user')
    lotes = relationship("UserLote", back_populates="user")

    def to_dict(self):
        return {
            "id": self.id,
            "nome_usuario": self.nome_usuario,
            "email_usuario": self.email_usuario,
            "perfil_usuario": self.perfil_usuario
        }

class UserLote(Base):
    __tablename__ = "newtab_usuarios_lotes"
    user_id = Column(BigInteger, ForeignKey("newtab_usuarios.id"), primary_key=True)
    codigo_lote = Column(Integer, ForeignKey("newtab_lotes.codigo_lote"), primary_key=True)
    user = relationship("User", back_populates="lotes")
    unit = relationship("Unit", back_populates="users_lotes")


class Morador(Base):
    __tablename__ = "newtab_moradores"

    id = Column(BigInteger, primary_key=True, index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    codigo_lote = Column(BigInteger, ForeignKey("newtab_lotes.codigo_lote"))
    nome = Column(String)
    cpf = Column(String)
    data_nascimento = Column(Date)
    fone1 = Column(String)
    fone2 = Column(String)
    contato_principal = Column(Boolean)
    email = Column(String)
    nome_lote = Column(String)
    fone3 = Column(String)

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "codigo_lote": self.codigo_lote,
            "nome": self.nome,
            "cpf": self.cpf,
            "data_nascimento": self.data_nascimento.isoformat() if self.data_nascimento else None,
            "fone1": self.fone1,
            "fone2": self.fone2,
            "contato_principal": self.contato_principal,
            "email": self.email,
            "nome_lote": self.nome_lote,
            "fone3": self.fone3
        }