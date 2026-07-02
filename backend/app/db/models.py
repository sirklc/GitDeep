from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)  # optional for existing users
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    analyses = relationship("RepoAnalysisRecord", back_populates="owner")

class RepoAnalysisRecord(Base):
    __tablename__ = "repo_analyses"

    id = Column(Integer, primary_key=True, index=True)
    repo_name = Column(String, index=True)
    health_status = Column(String)  # HEALTHY, AT RISK, DEAD
    health_score = Column(Integer)
    summary_text = Column(String)
    metrics_json = Column(Text)    # all raw JSON data as string
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    # nullable=True: anonymous (unauthenticated) analyses have no owner
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    owner = relationship("User", back_populates="analyses")
