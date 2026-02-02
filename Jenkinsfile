pipeline {
    agent any

    stages {
        stage('Deploy FastAPI') {
            steps {
                // This uses the 'vps-ssh' credential you created in your first screenshot
                sshagent(['vps-ssh']) {
                    sh '''
                    sh "ssh -o StrictHostKeyChecking=no root@72.61.169.230 '"
                    cd /root/quickfolio/backend &&
                    git fetch origin &&
                    git checkout master &&
                    git pull origin master &&
                    source venv/bin/activate &&
                    pip install -r requirements.txt &&
                    systemctl restart quickfolio.service
                    '
                    '''
                }
            }
        }
    }
}



