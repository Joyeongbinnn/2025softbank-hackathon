# backend/api/routes/jenkins_logs.py

import os
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

JENKINS_URL = os.getenv("JENKINS_URL")
JENKINS_USER = os.getenv("JENKINS_USER")
JENKINS_TOKEN = os.getenv("JENKINS_TOKEN")
JOB_NAME = os.getenv("JENKINS_JOB_NAME", "yoitang-autodeploy")


class LogChunk(BaseModel):
    chunk: str       # 새로 추가된 로그 텍스트
    nextOffset: int  # 다음 요청에 쓸 offset
    hasMore: bool    # Jenkins가 아직 더 쓸 로그가 있는지


@router.get("/logs/{build_number}", response_model=LogChunk)
def get_jenkins_logs(build_number: int, offset: int = 0):
    """
    Jenkins progressiveText를 이용해 부분 로그만 가져오기
    """
    if not (JENKINS_URL and JENKINS_USER and JENKINS_TOKEN):
        raise HTTPException(
            status_code=500,
            detail="Jenkins 환경변수가 설정되지 않았습니다.",
        )

    url = (
        f"{JENKINS_URL}/job/{JOB_NAME}/{build_number}/logText/progressiveText"
        f"?start={offset}"
    )

    try:
        resp = requests.get(
            url,
            auth=(JENKINS_USER, JENKINS_TOKEN),
            timeout=10,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Jenkins 호출 실패: {e}")

    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Jenkins 응답 코드: {resp.status_code}",
        )

    chunk = resp.text or ""
    size_header = resp.headers.get("X-Text-Size")
    next_offset = int(size_header) if size_header is not None else offset + len(chunk)
    more_header = resp.headers.get("X-More-Data", "false").lower()
    has_more = more_header == "true"

    return LogChunk(chunk=chunk, nextOffset=next_offset, hasMore=has_more)
