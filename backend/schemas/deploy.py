from pydantic import BaseModel, HttpUrl, field_validator
import re


class DeployRequest(BaseModel):
    prefix: str
    git_repo: HttpUrl
    branch: str = "main"
    use_repo_dockerfile: bool = False
    frontend_stack: str = "react-vite"

    @field_validator("prefix")
    @classmethod
    def validate_prefix(cls, v: str) -> str:
        if not re.fullmatch(r"[a-z0-9-]+", v):
            raise ValueError("prefix는 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.")
        return v
    