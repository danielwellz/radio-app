import sys
import subprocess
import os

def check_installation(name, command):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {name} is installed")
            return True
        else:
            print(f"❌ {name} is NOT installed")
            return False
    except:
        print(f"❌ {name} is NOT installed")
        return False

print("Checking installations...")

# Check Python
check_installation("Python", "python --version")

# Check Redis
check_installation("Redis", "redis-cli ping")

# Check PostgreSQL
check_installation("PostgreSQL", "psql --version")

# Check FFmpeg
check_installation("FFmpeg", "ffmpeg -version")

# Check Node.js
check_installation("Node.js", "node --version")

print("\nInstallation check complete!")