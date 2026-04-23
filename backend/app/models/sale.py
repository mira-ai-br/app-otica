from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, DateTime, ForeignKey, Numeric, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)
    appointment_id: Mapped[int | None] = mapped_column(ForeignKey("appointments.id"), nullable=True)
    valor_total: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    forma_pagamento: Mapped[str] = mapped_column(String(30))  # dinheiro|pix|credito|debito|boleto
    parcelas: Mapped[int] = mapped_column(Integer, default=1)
    grau_od: Mapped[str | None] = mapped_column(String(50), nullable=True)
    grau_oe: Mapped[str | None] = mapped_column(String(50), nullable=True)
    observacoes: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    customer: Mapped["Customer"] = relationship(back_populates="sales")
    appointment: Mapped["Appointment | None"] = relationship(back_populates="sale")
    photos: Mapped[list["SalePhoto"]] = relationship(back_populates="sale", cascade="all, delete-orphan")


class SalePhoto(Base):
    __tablename__ = "sale_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id"), index=True)
    tipo: Mapped[str] = mapped_column(String(20))  # oculos|nota_fiscal|ordem_servico
    url: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    sale: Mapped["Sale"] = relationship(back_populates="photos")
