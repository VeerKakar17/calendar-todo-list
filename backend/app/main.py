from fastapi import FastAPI, HTTPException, Depends, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime, timedelta, timezone
from typing import List, Annotated, Optional

from sqlalchemy import select
import models
from models import *
import database
from database import engine, get_db
from sqlalchemy.orm import Session
from schemas import *
import bcrypt
import jwt
from json import dumps
from jwt.exceptions import InvalidTokenError

app = FastAPI()
origins = [
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Allow cookies and credentials to be sent
    allow_methods=["*"],     # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],     # Allow all headers in the request
)
    
database.Base.metadata.create_all(bind=engine)

db_dependency = Annotated[Session, Depends(get_db)]

SECRET_KEY = "aaef54aee7ea6b3df86e50f888a8d2c7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@app.post("/tasks", response_model=TaskResponse)
async def create_task(response: Response, task: TaskCreate, db: db_dependency, access_token: Optional[str] = Cookie(default=None), refresh_token: Optional[str] = Cookie(default=None)):
    # Verify user id
    user_id = verify_cookie(response, access_token, refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail='User authentication token Expired')
    
    # Check if user exists
    user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Create task with auto-generated task_id
    db_task = models.Task(
        text=task.text, 
        is_completed=False, 
        due_date=task.due_date, 
        task_type=task.task_type, 
        task_class=task.task_class, 
        repeat_type=None, 
        user_id=user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)  # This gets the auto-generated task_id
    return db_task

@app.post("/users")
async def create_user(user: UserCreate, db: db_dependency):
    # Check for existing email
    if db.query(models.Users).filter(models.Users.email == user.email).first():
        raise HTTPException(status_code=400, detail='Email already exists.')
    
    # Check for existing username
    if db.query(models.Users).filter(models.Users.username == user.username).first():
        raise HTTPException(status_code=400, detail='Username is taken.')
    
    # Create user with auto-generated user_id
    db_user = models.Users(
        username=user.username, 
        email=user.email, 
        password=get_hashed_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)  # This gets the auto-generated user_id
    return {"message": "Successfully created user"}
    
@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(response: Response, db: db_dependency, access_token: Optional[str] = Cookie(default=None), refresh_token: Optional[str] = Cookie(default=None)):
    user_id = verify_cookie(response, access_token, refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail='User authentication token Expired')
    
    user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found.')
    return user.tasks

@app.get("/users", response_model=UserResponse)
async def get_user(user_id: int, db: db_dependency, response: Response, access_token: Optional[str] = Cookie(default=None), refresh_token: Optional[str] = Cookie(default=None)):
    user_id = verify_cookie(response, access_token, refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail='User authentication token Expired')
    
    user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found.')
    return user

@app.post("/login")
async def login(response: Response, user_credentials: UserLogin, db: db_dependency):
    user = db.query(models.Users).filter((models.Users.username == user_credentials.username) | (models.Users.email == user_credentials.username)).first()
    if (not user):
        raise HTTPException(status_code=401, detail="Invalid Username or Email.")
    
    success = check_password(user_credentials.password, user.password)
    
    if not success:
        raise HTTPException(status_code=401, detail="Incorrect Password.")
    
    access_token = create_access_token(user.id)
    refresh_token = create_access_token(user.id, timedelta(days=3))
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax")
    return {"message":"Logged in successfully"}
    
def get_hashed_password(plain_text_password):
    # Hash a password for the first time
    #   (Using bcrypt, the salt is saved into the hash itself)
    password_bytes = plain_text_password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt)

def check_password(plain_text_password, hashed_password):
    password_bytes = plain_text_password.encode('utf-8')
    # Convert base64 string back to bytes
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(user_id: int, expires_delta: timedelta | None = None):
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)
        
    payload = {
        "user_id": user_id,
        "expires": expire.isoformat()
    }
    
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
    
def decode_jwt(token: str):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_token, (datetime.fromisoformat(decoded_token["expires"]) >= datetime.now(timezone.utc))
    except:
        return None, False

def verify_cookie(response: Response, access_token: Optional[str] = Cookie(default=None), refresh_token: Optional[str] = Cookie(default=None)):
    if not access_token or not refresh_token:
        return None
    
    # Try to decode access token first
    result, success = decode_jwt(access_token)
    if success and result and "user_id" in result:
        return result["user_id"]
    
    # If access token failed, try refresh token
    refresh, refresh_success = decode_jwt(refresh_token)
    if refresh_success and refresh and "user_id" in refresh:
        # Create new access token using user_id from refresh token
        new_access_token = create_access_token(refresh["user_id"])
        response.set_cookie(key="access_token", value=new_access_token, httponly=True, secure=False, samesite="lax")
        return refresh["user_id"]
    
    # Both tokens failed - clear cookies
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return None