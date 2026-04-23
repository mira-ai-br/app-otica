from datetime import date, datetime
from pydantic import BaseModel


class CustomerBase(BaseModel):
    nome: str
    telefone: str
    cpf: str | None = None
    data_nascimento: date | None = None
    email: str | None = None
    observacoes: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CustomerBase):
    nome: str | None = None
    telefone: str | None = None


class CustomerOut(CustomerBase):
    id: int
    created_at: datetime
    total_gasto: float = 0
    num_compras: int = 0
    ultima_compra: datetime | None = None
    segmento: str = "novo"  # novo|recorrente|inativo

    model_config = {"from_attributes": True}


class CustomerList(BaseModel):
    id: int
    nome: str
    telefone: str
    total_gasto: float = 0
    num_compras: int = 0
    ultima_compra: datetime | None = None
    segmento: str = "novo"

    model_config = {"from_attributes": True}
