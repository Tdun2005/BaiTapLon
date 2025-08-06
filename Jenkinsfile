pipeline {
    agent any

    environment {
        SITE_NAME = "QuanLyThietBiSite"
        IIS_PORT = "81"
        SOURCE_PATH = "D:\\BaiTapLon\\QuanLyThietBi\\_frontend"
        IIS_PATH = "C:\\wwwroot\\QuanLyThietBi"
    }

    stages {
        stage('🧹 Clean Old Deploy Folder') {
            steps {
                echo '🧹 Xoá nội dung cũ trong thư mục IIS...'
                bat '''
                if exist "%IIS_PATH%" (
                    rmdir /S /Q "%IIS_PATH%"
                )
                mkdir "%IIS_PATH%"
                '''
            }
        }

        stage('📂 Copy Static Web to IIS Folder') {
            steps {
                echo '📂 Copy frontend vào thư mục IIS...'
                bat '''
                if exist "%SOURCE_PATH%" (
                    xcopy "%SOURCE_PATH%\\*" "%IIS_PATH%\\" /E /Y /I /R
                ) else (
                    echo ❌ SOURCE_PATH không tồn tại!
                    exit 1
                )
                '''
            }
        }

        stage('🌐 Deploy to IIS') {
            steps {
                echo "🌐 Deploy web lên IIS cổng ${env.IIS_PORT}..."

                bat """
                powershell -NoProfile -ExecutionPolicy Bypass -Command "
                    Import-Module WebAdministration;
                    \$siteName = '${env.SITE_NAME}';
                    \$port = ${env.IIS_PORT};
                    \$physicalPath = '${env.IIS_PATH}';

                    if (!(Test-Path \$physicalPath)) {
                        Write-Error '❌ Thư mục deploy không tồn tại!';
                        exit 1;
                    }

                    if (Test-Path IIS:\\Sites\\\$siteName) {
                        Write-Output '🌐 Site đã tồn tại. Restart lại...';
                        Restart-WebItem IIS:\\Sites\\\$siteName;
                    } else {
                        Write-Output '🆕 Tạo mới site IIS...';
                        New-Website -Name \$siteName -Port \$port -PhysicalPath \$physicalPath -Force;
                    }
                "
                """
            }
        }

        stage('✅ Finish') {
            steps {
                echo '✅ Triển khai xong. Truy cập:'
                echo '👉 http://localhost:81'
            }
        }
    }
}
