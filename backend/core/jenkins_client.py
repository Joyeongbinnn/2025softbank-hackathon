import os
import requests
import time
import logging
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

        # logger
        self.logger = logging.getLogger("JenkinsClient")

    def trigger_build(
        self,
        prefix: str,
        git_repo: str,
        branch: str = "main",
        use_repo_dockerfile: bool = False,
        frontend_stack: str = "react-vite",
        git_pat: str | None = None,   # 👈 추가

    ) -> int:
        url = f"{self.base_url}/job/{self.job_name}/buildWithParameters"

        data = {
            "PREFIX": prefix,
            "GIT_REPO": git_repo,
            "BRANCH": branch,
            "USE_REPO_DOCKERFILE": str(use_repo_dockerfile).lower(),  # true/False
            "FRONTEND_STACK": frontend_stack,
        }
        if git_pat:
            data["GIT_PAT"] = git_pat  # 👈 PAT 있을 때만 전달

        # Try to obtain CSRF crumb (if Jenkins requires it) and include in headers
        headers = {}
        try:
            crumb_field, crumb = self._get_crumb()
            if crumb_field and crumb:
                headers[crumb_field] = crumb
        except Exception as e:
            # Log but continue; some Jenkins setups don't require crumb
            self.logger.debug(f"Failed to get Jenkins crumb: {e}")

        resp = requests.post(url, auth=HTTPBasicAuth(self.username, self.token), data=data, headers=headers, timeout=10, verify=True)
        if resp.status_code not in (201, 202):
            # Log response for debugging (may include HTML error page)
            self.logger.error(
                "Jenkins buildWithParameters failed",
                extra={"status": resp.status_code, "body": resp.text[:4000]},
            )
            raise RuntimeError(f"Jenkins 호출 실패 (status={resp.status_code}, body={resp.text})")

        location = resp.headers.get("Location", "")
        if not location:
            return -1

        try:
            queue_id = int(location.rstrip("/").split("/")[-1])
        except ValueError:
            queue_id = -1

        return queue_id
    
    def get_build_number_from_queue(self, queue_id: int, timeout: int = 60, interval: float = 2.0) -> int:
        """
        queue_id로 해당 빌드의 build_number(예: 31)를 조회.
        빌드가 시작되기 전까지는 executable이 없으므로, 일정 시간 폴링.
        """
        url = f"{self.base_url}/queue/item/{queue_id}/api/json"

        start_time = time.time()
        while time.time() - start_time < timeout:
            resp = requests.get(url, auth=HTTPBasicAuth(self.username, self.token), timeout=5, verify=True)
            resp.raise_for_status()
            data = resp.json()

            executable = data.get("executable")
            if executable and "number" in executable:
                return int(executable["number"])

            # 아직 빌드가 안 붙은 상태 → 잠시 대기 후 재조회
            time.sleep(interval)

        raise RuntimeError(f"빌드 번호를 가져오지 못했습니다. (queue_id={queue_id})")

    def _get_crumb(self):
        """
        Jenkins CSRF crumb을 가져옵니다. 실패하면 (None, None)을 반환합니다.
        """
        url = f"{self.base_url}/crumbIssuer/api/json"
        try:
            resp = requests.get(url, auth=HTTPBasicAuth(self.username, self.token), timeout=5, verify=True)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("crumbRequestField"), data.get("crumb")
        except Exception as e:
            self.logger.debug(f"Error while fetching crumb: {e}")
        return None, None

    def get_build_log_chunk(self, build_number: int, start: int = 0):
        """
        progressiveText API를 이용해 텍스트 로그 조각을 가져옴.
        """
        url = f"{self.base_url}/job/{self.job_name}/{build_number}/logText/progressiveText"

        resp = requests.get(
            url,
            params={"start": start},
            auth=HTTPBasicAuth(self.username, self.token),
            timeout=10,
            verify=True,
        )
        if resp.status_code != 200:
            raise RuntimeError(f"로그 조회 실패 (status={resp.status_code}, body={resp.text})")

        text = resp.text
        next_start = int(resp.headers.get("X-Text-Size", "0"))
        more_data = resp.headers.get("X-More-Data") == "true"

        return {
            "text": text,
            "next_start": next_start,
            "more_data": more_data,
        }