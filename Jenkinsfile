pipeline {
    agent any

    environment {
        SITE_NAME = "QuanLyThietBiSite"
        IIS_PORT = "81"
        IIS_PATH = "C:\\wwwroot\\QuanLyThietBi"
    }

    stages {
        stage('🔁 Clone Source Code') {
            steps {
                echo 'Cloning source code từ GitHub...'
                git branch: 'main', url: 'https://github.com/Tdun2005/BaiTapLon.git'
            }
        }

        stage('🧹 Clean Old Deploy Folder') {
            steps {
                echo 'Xoá nội dung cũ trong thư mục deploy...'
                bat 'rmdir /S /Q "%IIS_PATH%"'
                bat 'mkdir "%IIS_PATH%"'
            }
        }

        stage('📂 Copy Static Web to IIS Folder') {
            steps {
                echo 'Copy thư mục _frontend vào thư mục IIS...'
                bat 'xcopy "%WORKSPACE%\\QuanLyThietBi\\_frontend" "%IIS_PATH%" /E /Y /I /R'
            }
        }

        stage('🌐 Deploy to IIS') {
            steps {
                echo "Triển khai website lên IIS tại cổng ${env.IIS_PORT}..."

                bat """
                powershell -NoProfile -ExecutionPolicy Bypass -Command "& {
                    Import-Module WebAdministration;
                    \$siteName = '${env.SITE_NAME}';
                    \$port = ${env.IIS_PORT};
                    \$physicalPath = '${env.IIS_PATH}';
                    if (Test-Path IIS:\\\\Sites\\\\\$siteName) {
                        Write-Output '🌐 Website đã tồn tại. Restart lại...';
                        Restart-WebItem IIS:\\\\Sites\\\\\$siteName;
                    } else {
                        Write-Output '🆕 Website chưa tồn tại. Tạo mới...';
                        New-Website -Name \$siteName -Port \$port -PhysicalPath \$physicalPath;
                    }
                }"
                """
            }
        }

        stage('✅ Finish') {
            steps {
                echo '✅ Triển khai hoàn tất! Vào trình duyệt truy cập:'
                echo '👉 http://localhost:81'
            }
        }
    }
}
