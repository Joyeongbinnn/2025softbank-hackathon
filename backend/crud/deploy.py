from sqlalchemy.orm import Session
from models.deploy import Deploy

def get_deploy(db: Session, deploy_id: int) -> Deploy:
    return db.query(Deploy).filter(Deploy.deploy_id == deploy_id).first()

def get_deploys_by_user_id(db: Session, user_id: int, limit: int = 4):
    return db.query(Deploy).filter(Deploy.user_id == user_id).order_by(Deploy.created_date.desc()).limit(limit).all()
