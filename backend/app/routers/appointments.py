from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.database import get_db
from app.models import Appointment

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


class AppointmentCreate(BaseModel):
    customer_id: int
    data_hora: datetime
    duracao_min: int = 30
    observacoes: str | None = None


class AppointmentUpdate(BaseModel):
    data_hora: datetime | None = None
    duracao_min: int | None = None
    status: str | None = None
    observacoes: str | None = None


@router.get("")
async def list_appointments(
    from_date: datetime = Query(..., alias="from"),
    to_date: datetime = Query(..., alias="to"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment).where(
            and_(Appointment.data_hora >= from_date, Appointment.data_hora <= to_date)
        ).order_by(Appointment.data_hora)
    )
    return result.scalars().all()


@router.post("", status_code=201)
async def create_appointment(payload: AppointmentCreate, db: AsyncSession = Depends(get_db)):
    appt = Appointment(**payload.model_dump())
    db.add(appt)
    await db.commit()
    await db.refresh(appt)
    return appt


@router.patch("/{id}")
async def update_appointment(id: int, payload: AppointmentUpdate, db: AsyncSession = Depends(get_db)):
    appt = await db.get(Appointment, id)
    if not appt:
        raise HTTPException(404, "Agendamento não encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(appt, field, value)
    await db.commit()
    await db.refresh(appt)
    return appt


@router.delete("/{id}", status_code=204)
async def delete_appointment(id: int, db: AsyncSession = Depends(get_db)):
    appt = await db.get(Appointment, id)
    if not appt:
        raise HTTPException(404)
    await db.delete(appt)
    await db.commit()
