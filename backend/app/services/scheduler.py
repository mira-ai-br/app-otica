from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select, func, and_, extract
from app.database import AsyncSessionLocal
from app.models import Customer, Sale, WhatsappMessage
from app.services.whatsapp_service import send_template

scheduler = AsyncIOScheduler()


async def _job_aniversarios():
    today = datetime.utcnow()
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Customer).where(
                and_(
                    extract("month", Customer.data_nascimento) == today.month,
                    extract("day", Customer.data_nascimento) == today.day,
                )
            )
        )
        for customer in result.scalars():
            ext_id = await send_template(customer.telefone, "aniversario_cupom", {"nome": customer.nome})
            db.add(WhatsappMessage(
                customer_id=customer.id,
                template_name="aniversario_cupom",
                tipo="aniversario",
                external_id=ext_id,
            ))
        await db.commit()


async def _job_reativacao():
    cutoff = datetime.utcnow() - timedelta(days=365)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Customer)
            .join(Sale)
            .group_by(Customer.id)
            .having(func.max(Sale.created_at) < cutoff)
            .having(func.max(Sale.created_at) >= cutoff - timedelta(days=7))
        )
        for customer in result.scalars():
            ext_id = await send_template(customer.telefone, "reativacao_1ano", {"nome": customer.nome})
            db.add(WhatsappMessage(
                customer_id=customer.id,
                template_name="reativacao_1ano",
                tipo="reativacao",
                external_id=ext_id,
            ))
        await db.commit()


def start_scheduler(hora: str = "09:00"):
    h, m = hora.split(":")
    scheduler.add_job(_job_aniversarios, CronTrigger(hour=int(h), minute=int(m)), id="aniversarios", replace_existing=True)
    scheduler.add_job(_job_reativacao, CronTrigger(hour=int(h), minute=int(m)), id="reativacao", replace_existing=True)
    scheduler.start()
