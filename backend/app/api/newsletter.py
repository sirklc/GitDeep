from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import NewsletterSubscriber
from app.schemas.auth import MessageOut, NewsletterSubscribeRequest
from app.services.mailer import send_newsletter_confirmation

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=MessageOut)
def subscribe(
    body: NewsletterSubscribeRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = body.email.lower()
    existing = db.scalar(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email))
    if existing is None:
        db.add(NewsletterSubscriber(email=email, locale=body.locale))
        db.commit()
        background.add_task(send_newsletter_confirmation, email, body.locale)
    return MessageOut(message="subscribed")
