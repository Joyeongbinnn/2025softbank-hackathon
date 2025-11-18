pipeline {
    agent any

    environment {
        INFRA_DIR = 'infra'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build images') {
            steps {
                dir("${INFRA_DIR}") {
                    sh '''
                      echo "[BUILD] backend & frontend Docker images"
                      docker compose build backend frontend
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                dir("${INFRA_DIR}") {
                    sh '''
                      echo "[DEPLOY] recreate backend & frontend containers"
                      docker compose up -d --no-deps --force-recreate backend frontend

                      echo "[RESTART] nginx to refresh routes/upstreams"
                      docker compose restart nginx

                      echo "[CLEAN] unused images"
                      docker image prune -f
                    '''
                }
            }
        }
    }
}
