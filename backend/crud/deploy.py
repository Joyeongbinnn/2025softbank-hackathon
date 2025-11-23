from sqlalchemy.orm import Session
from datetime import date
from models.deploy import Deploy, DeployStatus
from models.service import Service
from schemas.deploy import DeployCreate

def create_deploy(db: Session, deploy_data: DeployCreate) -> Deploy:
    new_deploy = Deploy(**deploy_data.model_dump())
    db.add(new_deploy)
    db.commit()
    db.refresh(new_deploy)
    return new_deploy

def get_deploy(db: Session, deploy_id: int) -> Deploy:
    return db.query(Deploy).filter(Deploy.deploy_id == deploy_id).first()

def get_latest_deploy_by_service(db: Session, service_id: int) -> Deploy:
    return db.query(Deploy).filter(Deploy.service_id == service_id).order_by(Deploy.created_date.desc()).first()

def get_deploys_by_service(db: Session, service_id: int, limit: int = 4):
    return db.query(Deploy).filter(Deploy.service_id == service_id).order_by(Deploy.created_date.desc()).limit(limit).all()

def get_today_user_deploys_count(db: Session, user_id: int) -> int:
    today = date.today()
    return db.query(Deploy).join(Service, Deploy.service_id == Service.service_id).filter(
        Service.user_id == user_id,
        Deploy.created_date >= today
    ).count()

def update_deploy_status(db: Session, deploy_id: int, status: str) -> Deploy:
    deploy = db.query(Deploy).filter(Deploy.deploy_id == deploy_id).first()
    if deploy:
        try:
            deploy.status = DeployStatus(status)
        except ValueError:
            raise ValueError(f"Invalid status value: {status}")
        db.commit()
        db.refresh(deploy)
    return deploy