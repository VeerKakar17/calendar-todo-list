from pydantic import BaseModel

class TaskCreate(BaseModel):
    text: str
    due_date: str
    task_type: str
    task_class: str

class TaskResponse(BaseModel):
    task_id: int
    text: str
    due_date: str
    task_type: str
    task_class: str
    user_id: int
    is_completed: bool
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    email: str

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    
    class Config:
        from_attributes = True
        
class UserLogin(BaseModel):
    username: str
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str