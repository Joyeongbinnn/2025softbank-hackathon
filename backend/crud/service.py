from sqlalchemy.orm import Session
from datetime import date
from crud.deploy import get_latest_deploy_by_service
from models.service import Service
from schemas.service import ServiceCreate

def create_service(db: Session, service_data: ServiceCreate) -> Service:
    new_service = Service(**service_data.model_dump())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

def get_service(db: Session, service_id: int) -> Service:
    return db.query(Service).filter(Service.service_id == service_id).first()

def get_services_by_user(db: Session, user_id: int) -> list[Service]:
    return db.query(Service).filter(Service.user_id == user_id).all()

def get_services_count_by_user(db: Session, user_id: int) -> int:
    return db.query(Service).filter(Service.user_id == user_id).count()

def get_success_services_count_by_user(db: Session, user_id: int) -> int:
    services = get_services_by_user(db, user_id)
    count = 0
    for service in services:
        latest_deploy = get_latest_deploy_by_service(db, service.service_id)
        if latest_deploy and latest_deploy.status == "SUCCESS":
            count += 1
    return count

def get_today_user_services_count(db: Session, user_id: int) -> int:
    today = date.today()
    return db.query(Service).filter(
        Service.user_id == user_id,
        Service.created_date >= today
    ).count()

def get_today_user_success_services_count(db: Session, user_id: int) -> int:
    today = date.today()
    services = get_services_by_user(db, user_id)
    count = 0
    for service in services:
        latest_deploy = get_latest_deploy_by_service(db, service.service_id)
        if latest_deploy and latest_deploy.status == "SUCCESS" and latest_deploy.created_date.date() == today:
            count += 1
    return count

def get_user_service_success_rate(db: Session, user_id: int) -> int:
    total_services = get_today_user_services_count(db, user_id)
    if total_services == 0:
        return 0
    
    success_services = get_today_user_success_services_count(db, user_id)
    return int((success_services / total_services) * 100)
