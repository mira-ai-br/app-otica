from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.database import get_db
from app.models import Customer, WhatsappMessage
from app.services.whatsapp_service import send_template, send_text
from app.config import settings

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


class SendManualPayload(BaseModel):
    customer_id: int
    mensagem: str | None = None
    template_name: str | None = None
    template_vars: dict = {}


@router.post("/send")
async def send_message(payload: SendManualPayload, db: AsyncSession = Depends(get_db)):
    customer = await db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(404, "Cliente não encontrado")

    if payload.template_name:
        ext_id = await send_template(customer.telefone, payload.template_name, payload.template_vars)
        tipo = "manual_template"
    else:
        ext_id = await send_text(customer.telefone, payload.mensagem)
        tipo = "manual"

    msg = WhatsappMessage(
        customer_id=customer.id,
        template_name=payload.template_name,
        tipo=tipo,
        corpo=payload.mensagem,
        external_id=ext_id,
    )
    db.add(msg)
    await db.commit()
    return {"status": "enviado", "external_id": ext_id}


@router.get("/webhook")
async def verify_webhook(request: Request):
    params = dict(request.query_params)
    if params.get("hub.verify_token") == settings.meta_wa_verify_token:
        return int(params.get("hub.challenge", 0))
    raise HTTPException(403, "Token inválido")


@router.post("/webhook")
async def receive_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    try:
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                for status in change.get("value", {}).get("statuses", []):
                    ext_id = status.get("id")
                    new_status = status.get("status")
                    if ext_id and new_status:
                        from sqlalchemy import select, update
                        await db.execute(
                            update(WhatsappMessage)
                            .where(WhatsappMessage.external_id == ext_id)
                            .values(status=new_status)
                        )
        await db.commit()
    except Exception:
        pass
    return {"status": "ok"}
