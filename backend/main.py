from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import Base, User, Deal, DealStatus
from .auth import validate_telegram_init_data
import os
from datetime import datetime

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)):
    init_data = request.headers.get("X-Telegram-InitData")
    if not init_data:
        raise HTTPException(401, "Missing init data")
    data = validate_telegram_init_data(init_data)
    tg_id = int(data.get("user", {}).get("id"))
    user = db.query(User).filter(User.tg_id == tg_id).first()
    if not user:
        user = User(tg_id=tg_id, username=data.get("user", {}).get("username"))
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.post("/api/user/register")
def register_user(user: User = Depends(get_current_user)):
    return {"status": "ok", "user_id": user.tg_id, "balance": user.balance}

@app.get("/api/dashboard")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deals = db.query(Deal).filter(
        (Deal.creator_id == user.tg_id) | (Deal.partner_id == user.tg_id)
    ).all()
    return {
        "balance": user.balance,
        "deals": [{"id": d.id, "title": d.title, "status": d.status, "price": d.price} for d in deals]
    }

@app.post("/api/deal/create")
def create_deal(deal_data: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_deal = Deal(
        title=deal_data["title"],
        description=deal_data.get("description", ""),
        price=deal_data["price"],
        creator_id=user.tg_id,
        creator_role=deal_data["role"],
        status=DealStatus.CREATED
    )
    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)
    return {"deal_id": new_deal.id}

@app.post("/api/deal/{deal_id}/accept")
def accept_deal(deal_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(404, "Deal not found")
    if deal.partner_id:
        raise HTTPException(400, "Already accepted")
    deal.partner_id = user.tg_id
    deal.status = DealStatus.ACCEPTED
    db.commit()
    return {"status": "accepted"}

@app.post("/api/deal/{deal_id}/deposit")
def deposit(deal_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal or deal.creator_role != "buyer" or deal.creator_id != user.tg_id:
        raise HTTPException(403, "Only buyer can deposit")
    if deal.status != DealStatus.ACCEPTED:
        raise HTTPException(400, "Deal not accepted")
    # Mock payment – deduct from buyer's balance, hold in escrow
    buyer = db.query(User).filter(User.tg_id == deal.creator_id).first()
    if buyer.balance < deal.price:
        raise HTTPException(402, "Insufficient balance")
    buyer.balance -= deal.price
    deal.status = DealStatus.SECURED
    deal.secured_at = datetime.utcnow()
    db.commit()
    return {"status": "secured"}

@app.post("/api/deal/{deal_id}/release")
def release(deal_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal or deal.creator_role != "buyer" or deal.creator_id != user.tg_id:
        raise HTTPException(403, "Only buyer can release")
    if deal.status != DealStatus.SECURED:
        raise HTTPException(400, "Deal not secured")
    seller = db.query(User).filter(User.tg_id == deal.partner_id).first()
    fee = deal.price * 0.05
    seller.balance += deal.price - fee
    deal.status = DealStatus.COMPLETED
    deal.completed_at = datetime.utcnow()
    db.commit()
    return {"status": "completed"}

@app.post("/api/deal/{deal_id}/dispute")
def dispute(deal_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(404, "Deal not found")
    if user.tg_id not in (deal.creator_id, deal.partner_id):
        raise HTTPException(403, "Not a participant")
    deal.status = DealStatus.DISPUTED
    db.commit()
    return {"status": "disputed"}
