from datetime import date, datetime
from sqlalchemy import String, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(200))
    telefone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    cpf: Mapped[str | None] = mapped_column(String(14), unique=True, nullable=True)
    data_nascimento: Mapped[date | None] = mapped_column(Date, nullable=True)
    sexo: Mapped[str | None] = mapped_column(String(30), nullable=True)  # feminino|masculino|outro|nao_informado
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    observacoes: Mapped[str | None] = mapped_column(nullable=True)
    segmento_manual: Mapped[str | None] = mapped_column(String(20), nullable=True)  # novo|recorrente|inativo — definido no cadastro
    primeiro_atendimento: Mapped[date | None] = mapped_column(Date, nullable=True)  # preenchido quando cliente já existia antes do sistema
    num_compras_anterior: Mapped[int] = mapped_column(default=0)  # compras antes do sistema
    total_gasto_anterior: Mapped[float] = mapped_column(default=0.0)  # valor antes do sistema
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    sales: Mapped[list["Sale"]] = relationship(back_populates="customer", lazy="select")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="customer", lazy="select")
    whatsapp_messages: Mapped[list["WhatsappMessage"]] = relationship(back_populates="customer", lazy="select")
