from pydantic import BaseModel

class TaskCreate(BaseModel):
    text: str
    due_date: str
    task_type: str
    task_class: str

class TaskResponse(BaseModel):
    id: int
    text: str
    due_date: str
    task_type: str
    task_class: str
    is_completed: bool
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    email: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    
    class Config:
        from_attributes = True
        
class UserLogin(BaseModel):
    username: str
    password: str