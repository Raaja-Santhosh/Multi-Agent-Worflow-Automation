from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

from uuid import UUID

class TaskRunCreate(BaseModel):
    goal: str

class TaskRunResponse(BaseModel):
    id: UUID
    goal: str
    status: str
    plan: Optional[List[Dict[str, Any]]] = None
    result: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
