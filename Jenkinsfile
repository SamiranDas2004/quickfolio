pipeline {
    agent any

    stages {
        stage('Deploy FastAPI') {
            steps {
                sshagent(['vps-ssh']) {
                    // We use triple single quotes for the 'sh' block
                    // and single quotes for the remote SSH commands.
                    sh '''
                    ssh -o StrictHostKeyChecking=no root@72.61.169.230 '
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