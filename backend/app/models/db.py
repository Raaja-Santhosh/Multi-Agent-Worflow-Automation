import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True, nullable=False)
    password = Column(Text, nullable=False)
    role = Column(Text, default='user')
    created_at = Column(DateTime, default=datetime.utcnow)

class TaskRun(Base):
    __tablename__ = 'task_runs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    goal = Column(Text, nullable=False)
    status = Column(Text, default='pending')
    plan = Column(JSONB)
    result = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    user = relationship("User")
    memories = relationship("AgentMemory", back_populates="run")
    logs = relationship("ObsLog", back_populates="run")

class AgentMemory(Base):
    __tablename__ = 'agent_memory'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    goal_text = Column(Text)
    embedding = Column(Vector(384))
    findings = Column(JSONB)
    run_id = Column(UUID(as_uuid=True), ForeignKey('task_runs.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    run = relationship("TaskRun", back_populates="memories")

class ObsLog(Base):
    __tablename__ = 'obs_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey('task_runs.id'))
    agent = Column(Text)
    tool = Column(Text)
    input_summary = Column(Text)
    output_summary = Column(Text)
    latency_ms = Column(Integer)
    success = Column(Boolean)
    error_msg = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    run = relationship("TaskRun", back_populates="logs")
