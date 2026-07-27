from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class DealStatus(str, enum.Enum):
    CREATED = "created"
    ACCEPTED = "accepted"
    SECURED = "secured"
    COMPLETED = "completed"
    DISPUTED = "disputed"

class User(Base):
    __tablename__ = "users"
    tg_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    deals_as_creator = relationship("Deal", foreign_keys="Deal.creator_id", backref="creator")
    deals_as_partner = relationship("Deal", foreign_keys="Deal.partner_id", backref="partner")

class Deal(Base):
    __tablename__ = "deals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.tg_id"))
    partner_id = Column(Integer, ForeignKey("users.tg_id"), nullable=True)
    creator_role = Column(String, nullable=False)  # "buyer" or "seller"
    status = Column(Enum(DealStatus), default=DealStatus.CREATED)
    created_at = Column(DateTime, default=datetime.utcnow)
    secured_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
