import requests

def normalize_repo_url(repo_url: str) -> str:
    repo = repo_url.rstrip("/")
    if repo.endswith(".git"):
        repo = repo[:-4]

    parts = repo.split("github.com/")[-1].split("/")
    owner = parts[0]
    name = parts[1]
    return f"{owner}/{name}"

def get_latest_commit(git_repo: str, branch: str):
    repo = normalize_repo_url(git_repo)
    url = f"https://api.github.com/repos/{repo}/commits?sha={branch}&per_page=1"
    
    response = requests.get(url)  # Public repo 기준, 토큰 없이도 가능
    response.raise_for_status()
    
    latest_commit = response.json()[0]
    commit_id = latest_commit['sha'][:6]
    commit_message = latest_commit['commit']['message']
    
    return commit_id, commit_message
