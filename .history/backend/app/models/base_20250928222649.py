from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())