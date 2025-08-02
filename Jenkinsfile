pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                echo '🔁 Cloning source code'
                git branch: 'main', url: 'https://github.com/Tdun2005/BaiTapLon.git'
            }
        }

        stage('Restore Packages') {
            steps {
                echo '📦 Restore packages'
                bat 'dotnet restore'
            }
        }

        stage('Build Project') {
            steps {
                echo '🏗️ Building project (.NET Core)'
                bat 'dotnet build --configuration Release'
            }
        }

        stage('Test Project') {
            steps {
                echo '✅ Running tests...'
                bat 'dotnet test --no-build --verbosity normal'
            }
        }

        stage('Publish to folder') {
            steps {
                echo '📤 Publishing to ./publish folder'
                bat 'dotnet publish -c Release -o ./publish'
            }
        }

        stage('Copy to Running Folder') {
            steps {
                echo '📁 Copy publish to C:\\wwwroot\\BaiTapLon'
                bat 'xcopy "%WORKSPACE%\\publish" "C:\\wwwroot\\BaiTapLon" /E /Y /I /R'
            }
        }

        stage('Deploy to IIS') {
            steps {
                echo '🌐 Deploying to IIS'
                powershell '''
                Import-Module WebAdministration

                $siteName = "BaiTapLonSite"
                $port = 81
                $path = "C:\\wwwroot\\BaiTapLon"

                if (-not (Test-Path IIS:\\Sites\\$siteName)) {
                    New-Website -Name $siteName -Port $port -PhysicalPath $path -ApplicationPool ".NET v4.5"
                }
                else {
                    Write-Output "Website already exists"
                }
                '''
            }
        }
    }
}
