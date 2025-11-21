import os
import requests
from requests.auth import HTTPBasicAuth


class JenkinsClient:
    """
    Jenkins buildWithParameters 호출용 클라이언트.
    환경 변수 예시:
      - JENKINS_URL   : https://www.yoitang.cloud/jenkins
      - JENKINS_USER  : admin
      - JENKINS_TOKEN : Jenkins API Token
      - JENKINS_JOB_NAME : yoitang-autodeploy (Default)
    """

    def __init__(self) -> None:
        self.base_url = os.getenv("JENKINS_URL", "").rstrip("/")
        self.username = os.getenv("JENKINS_USER", "")
        self.token = os.getenv("JENKINS_TOKEN", "")
        self.job_name = os.getenv("JENKINS_JOB_NAME", "yoitang-autodeploy")

        if not all([self.base_url, self.username, self.token]):
            raise RuntimeError("JENKINS_URL / JENKINS_USER / JENKINS_TOKEN 환경변수가 필요합니다.")

    def trigger_build(
        self,
        prefix: str,
        git_repo: str,
        branch: str = "main",
        use_repo_dockerfile: bool = False,
        frontend_stack: str = "react-vite",
    ) -> int:
        url = f"{self.base_url}/job/{self.job_name}/buildWithParameters"

        data = {
            "PREFIX": prefix,
            "GIT_REPO": git_repo,
            "BRANCH": branch,
            "USE_REPO_DOCKERFILE": str(use_repo_dockerfile).lower(),  # true/False
            "FRONTEND_STACK": frontend_stack,
        }

        resp = requests.post(url, auth=HTTPBasicAuth(self.username, self.token), data=data, timeout=10, verify=True)
        if resp.status_code not in (201, 202):
            raise RuntimeError(
                f"Jenkins 호출 실패 (status={resp.status_code}, body={resp.text})"
            )

        location = resp.headers.get("Location", "")
        if not location:
            return -1

        try:
            queue_id = int(location.rstrip("/").split("/")[-1])
        except ValueError:
            queue_id = -1

        return queue_id
    