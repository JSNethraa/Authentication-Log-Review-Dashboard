from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='analyst') # 'analyst', 'senior_analyst', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class LogBatch(db.Model):
    __tablename__ = 'log_batches'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    total_records = db.Column(db.Integer, default=0)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.String(80), default='system')
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'total_records': self.total_records,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'uploaded_by': self.uploaded_by
        }

class AuthLog(db.Model):
    __tablename__ = 'auth_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    batch_id = db.Column(db.Integer, db.ForeignKey('log_batches.id', ondelete='SET NULL'), nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    username = db.Column(db.String(100), nullable=False, index=True)
    ip_address = db.Column(db.String(50), nullable=False, index=True)
    auth_service = db.Column(db.String(50), default='Web-Portal') # SSH, Web-Portal, VPN, ActiveDirectory, FTP
    status = db.Column(db.String(20), nullable=False, index=True)  # SUCCESS, FAILURE
    failure_reason = db.Column(db.String(150), nullable=True)
    location = db.Column(db.String(100), default='Unknown')
    user_agent = db.Column(db.String(255), default='Standard Client')
    
    def to_dict(self):
        return {
            'id': self.id,
            'batch_id': self.batch_id,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S') if self.timestamp else None,
            'username': self.username,
            'ip_address': self.ip_address,
            'auth_service': self.auth_service,
            'status': self.status,
            'failure_reason': self.failure_reason,
            'location': self.location,
            'user_agent': self.user_agent
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(50), nullable=False) # BRUTE_FORCE, OFF_HOURS, ACCOUNT_SPRAY, COMPROMISED_ACCOUNT
    severity = db.Column(db.String(20), nullable=False)   # LOW, MEDIUM, HIGH, CRITICAL
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    target_user = db.Column(db.String(100), nullable=True)
    source_ip = db.Column(db.String(50), nullable=True)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    status = db.Column(db.String(30), default='OPEN')     # OPEN, IN_REVIEW, RESOLVED, FALSE_POSITIVE
    batch_id = db.Column(db.Integer, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'title': self.title,
            'description': self.description,
            'target_user': self.target_user,
            'source_ip': self.source_ip,
            'detected_at': self.detected_at.strftime('%Y-%m-%d %H:%M:%S') if self.detected_at else None,
            'status': self.status,
            'batch_id': self.batch_id
        }

class Investigation(db.Model):
    __tablename__ = 'investigations'
    
    id = db.Column(db.Integer, primary_key=True)
    alert_id = db.Column(db.Integer, db.ForeignKey('alerts.id', ondelete='CASCADE'), nullable=True)
    analyst_name = db.Column(db.String(80), nullable=False)
    action_taken = db.Column(db.String(100), nullable=False) # Status Change, IP Blocked, Account Frozen, False Positive Tagged, Note Added
    notes = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alert_id': self.alert_id,
            'analyst_name': self.analyst_name,
            'action_taken': self.action_taken,
            'notes': self.notes,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }
