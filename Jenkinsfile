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
                bat 'rmdir /S /Q "%IIS_PATH%"'
                bat 'mkdir "%IIS_PATH%"'
            }
        }

        stage('📂 Copy Static Web to IIS Folder') {
            steps {
                echo '📂 Copy _frontend từ D:\\BaiTapLon vào thư mục IIS...'
                bat 'xcopy "%SOURCE_PATH%" "%IIS_PATH%" /E /Y /I /R'
            }
        }

        stage('🌐 Deploy to IIS') {
            steps {
                echo "🌐 Triển khai website lên IIS tại cổng ${env.IIS_PORT}..."

                bat """
                powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
                "Import-Module WebAdministration; ^
                \$siteName = '${SITE_NAME}'; ^
                \$port = ${IIS_PORT}; ^
                \$physicalPath = '${IIS_PATH}'; ^
                if (Test-Path IIS:\\\\Sites\\\\\$siteName) { ^
                    Write-Output '🌐 Website đã tồn tại. Restart lại...'; ^
                    Restart-WebItem IIS:\\\\Sites\\\\\$siteName ^
                } else { ^
                    Write-Output '🆕 Website chưa tồn tại. Tạo mới...'; ^
                    New-Website -Name \$siteName -Port \$port -PhysicalPath \$physicalPath ^
                }"
                """
            }
        }

        stage('✅ Finish') {
            steps {
                echo '✅ Triển khai hoàn tất! Truy cập:'
                echo '👉 http://localhost:81'
            }
        }
    }
}
