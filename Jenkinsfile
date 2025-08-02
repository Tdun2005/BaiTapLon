pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                echo '🔁 Cloning source code'
                git branch: 'main', url: 'https://github.com/Tdun2005/BaiTapLon.git'
            }
        }

        stage('Copy Static Web') {
            steps {
                echo '📂 Copy QuanLyThietBi to IIS folder'
                bat 'xcopy "%WORKSPACE%\\QuanLyThietBi" "C:\\wwwroot\\QuanLyThietBi" /E /Y /I /R'
            }
        }

        stage('Deploy to IIS') {
            steps {
                echo '🌐 Tạo website QuanLyThietBi trên IIS (port 81)'
                powershell '''
                Import-Module WebAdministration

                $siteName = "QuanLyThietBiSite"
                $port = 81
                $physicalPath = "C:\\wwwroot\\QuanLyThietBi"

                if (-not (Test-Path IIS:\\Sites\\$siteName)) {
                    New-Website -Name $siteName -Port $port -PhysicalPath $physicalPath
                }
                else {
                    Write-Output "✅ Website đã tồn tại, không cần tạo lại."
                }
                '''
            }
        }
    }
}
