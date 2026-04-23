from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class WhatsappMessage(Base):
    __tablename__ = "whatsapp_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)
    template_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tipo: Mapped[str] = mapped_column(String(30))  # aniversario|reativacao|manual|agendamento
    corpo: Mapped[str | None] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="enviado")  # enviado|entregue|lido|falha
    external_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    enviado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    customer: Mapped["Customer"] = relationship(back_populates="whatsapp_messages")


class AppSettings(Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    nome_otica: Mapped[str] = mapped_column(String(200), default="Ótica Nina")
    cor_primaria: Mapped[str] = mapped_column(String(7), default="#D4217A")
    cor_secundaria: Mapped[str] = mapped_column(String(7), default="#3D5DB5")
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cupom_aniversario_valor: Mapped[str] = mapped_column(String(20), default="10")
    cupom_aniversario_tipo: Mapped[str] = mapped_column(String(10), default="percentual")
    horario_disparo_diario: Mapped[str] = mapped_column(String(5), default="09:00")
    meta_wa_phone_number_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
