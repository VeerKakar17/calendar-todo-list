from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
import database

class Task(database.Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    text = Column(String, index=False)
    is_completed = Column(Boolean, index=True, default=False)
    due_date = Column(String, index=True, nullable=True)
    task_type = Column(String, index=True, nullable=True)
    task_class = Column(String, index=True, nullable=True)
    repeat_type = Column(String, index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    user = relationship("Users", back_populates="tasks")

class Users(database.Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password = Column(String)
    tasks = relationship("Task", back_populates="user")