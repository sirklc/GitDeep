from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import CreditTransaction, User

router = APIRouter(prefix="/api/credits", tags=["credits"])


class BalanceOut(BaseModel):
    credit_balance: int


class TransactionOut(BaseModel):
    id: int
    delta: int
    balance_after: int
    reason: str
    job_id: str | None
    created_at: str


@router.get("/balance", response_model=BalanceOut)
def balance(user: User = Depends(get_current_user)):
    return BalanceOut(credit_balance=user.credit_balance)


@router.get("/history", response_model=list[TransactionOut])
def history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
):
    rows = db.scalars(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == user.id)
        .order_by(CreditTransaction.id.desc())
        .limit(min(limit, 200))
    ).all()
    return [
        TransactionOut(
            id=tx.id,
            delta=tx.delta,
            balance_after=tx.balance_after,
            reason=tx.reason.value,
            job_id=tx.job_id,
            created_at=tx.created_at.isoformat(),
        )
        for tx in rows
    ]
