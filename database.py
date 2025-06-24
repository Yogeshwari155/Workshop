import os
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime, timezone
import bcrypt

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/workshop_platform")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Association table for workshop tags
workshop_tags = Table(
    'workshop_tags',
    Base.metadata,
    Column('workshop_id', Integer, ForeignKey('workshops.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # user, admin, organizer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    registrations = relationship("Registration", back_populates="user")
    organized_workshops = relationship("Workshop", back_populates="organizer_user")
    
    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

class Workshop(Base):
    __tablename__ = "workshops"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    organizer = Column(String(100), nullable=False)
    organizer_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    instructor = Column(String(100), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    time = Column(String(20), nullable=False)
    location = Column(String(200), nullable=False)
    city = Column(String(50), nullable=False)
    category = Column(String(50), nullable=False)
    level = Column(String(20), nullable=False)  # Beginner, Intermediate, Advanced
    duration = Column(String(20), nullable=False)
    price = Column(Float, default=0.0)
    max_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    mode = Column(String(20), default="manual")  # manual, automated
    status = Column(String(20), default="active")  # active, cancelled, completed
    featured = Column(Boolean, default=False)
    image_url = Column(String(500), nullable=True)
    prerequisites = Column(Text, nullable=True)  # JSON string
    what_you_learn = Column(Text, nullable=True)  # JSON string
    agenda = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    organizer_user = relationship("User", back_populates="organized_workshops")
    registrations = relationship("Registration", back_populates="workshop")
    tags = relationship("Tag", secondary=workshop_tags, back_populates="workshops")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    workshops = relationship("Workshop", secondary=workshop_tags, back_populates="tags")

class Registration(Base):
    __tablename__ = "registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    registration_type = Column(String(20), nullable=False)  # manual, automated
    status = Column(String(30), default="pending")  # pending, confirmed, rejected, cancelled
    payment_status = Column(String(30), default="not_required")  # not_required, pending, completed, failed
    payment_method = Column(String(20), nullable=True)  # upi, bank_transfer, card
    transaction_id = Column(String(100), nullable=True)
    upi_id = Column(String(100), nullable=True)
    payment_screenshot_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="registrations")
    workshop = relationship("Workshop", back_populates="registrations")

# Database functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)

def init_admin_user():
    """Create default admin user if not exists"""
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@workshop.com").first()
        if not admin:
            admin = User(
                name="Admin User",
                email="admin@workshop.com",
                password_hash=User.hash_password("admin123"),
                role="admin",
                phone="+91 9999999999"
            )
            db.add(admin)
            db.commit()
            print("Default admin user created: admin@workshop.com / admin123")
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    init_admin_user()
    print("Database tables created successfully!")