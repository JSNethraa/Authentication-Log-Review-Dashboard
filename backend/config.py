import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'cyber-soc-defense-matrix-jwt-secret-key-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'auth_dashboard.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRATION = timedelta(days=7)
    
    # Detection Thresholds
    BRUTE_FORCE_WINDOW_MINUTES = 10
    BRUTE_FORCE_THRESHOLD = 5
    SPRAY_WINDOW_MINUTES = 15
    SPRAY_USER_COUNT_THRESHOLD = 3
    OFF_HOURS_START = 22  # 10 PM
    OFF_HOURS_END = 5     # 5 AM
