from datetime import datetime, timedelta
from collections import defaultdict
from models import db, Alert, AuthLog

class DetectionEngine:
    def __init__(self, config=None):
        self.brute_force_window = timedelta(minutes=10)
        self.brute_force_threshold = 5
        self.spray_window = timedelta(minutes=15)
        self.spray_user_threshold = 3
        self.off_hours = (22, 5) # 10 PM to 5 AM

    def run_detection(self, batch_id=None):
        """
        Runs comprehensive security rules against authentication logs.
        Can run against logs in a specific batch or entire database.
        """
        query = AuthLog.query
        if batch_id:
            query = query.filter_by(batch_id=batch_id)
            
        logs = query.order_by(AuthLog.timestamp.asc()).all()
        if not logs:
            return 0
            
        new_alerts = []
        
        # 1. Detect Repeated Failed Logins (Brute Force) & Account Compromise
        new_alerts.extend(self._detect_brute_force(logs, batch_id))
        
        # 2. Detect Suspicious Login Times (Off-Hours Access)
        new_alerts.extend(self._detect_off_hours(logs, batch_id))
        
        # 3. Detect Password Spraying (Single IP probing multiple user accounts)
        new_alerts.extend(self._detect_password_spray(logs, batch_id))
        
        # Deduplicate and save alerts to database
        saved_count = 0
        for alert_data in new_alerts:
            # Check if identical alert already exists to prevent duplicates
            existing = Alert.query.filter_by(
                alert_type=alert_data['alert_type'],
                target_user=alert_data.get('target_user'),
                source_ip=alert_data.get('source_ip'),
                title=alert_data['title']
            ).first()
            
            if not existing:
                alert = Alert(
                    alert_type=alert_data['alert_type'],
                    severity=alert_data['severity'],
                    title=alert_data['title'],
                    description=alert_data['description'],
                    target_user=alert_data.get('target_user'),
                    source_ip=alert_data.get('source_ip'),
                    status='OPEN',
                    batch_id=batch_id,
                    detected_at=alert_data.get('detected_at', datetime.utcnow())
                )
                db.session.add(alert)
                saved_count += 1
                
        db.session.commit()
        return saved_count

    def _detect_brute_force(self, logs, batch_id):
        alerts = []
        # Group failure logs by (username, ip_address)
        user_ip_events = defaultdict(list)
        
        for log in logs:
            user_ip_events[(log.username, log.ip_address)].append(log)
            
        for (username, ip), event_list in user_ip_events.items():
            # Sliding window over events
            failures_streak = []
            
            for i, event in enumerate(event_list):
                if event.status == 'FAILURE':
                    failures_streak.append(event)
                else:
                    # An event succeeded!
                    # Check if preceded by a brute force streak
                    recent_failures = [f for f in failures_streak if event.timestamp - f.timestamp <= self.brute_force_window]
                    if len(recent_failures) >= self.brute_force_threshold:
                        alerts.append({
                            'alert_type': 'COMPROMISED_ACCOUNT',
                            'severity': 'CRITICAL',
                            'title': f'Account Compromise After Brute Force: {username}',
                            'description': (f'IP {ip} performed {len(recent_failures)} failed login attempts against '
                                            f'account "{username}" between {recent_failures[0].timestamp.strftime("%H:%M:%S")} and '
                                            f'{recent_failures[-1].timestamp.strftime("%H:%M:%S")}, immediately followed by a SUCCESSFUL login at '
                                            f'{event.timestamp.strftime("%H:%M:%S")}. Immediate credential reset required.'),
                            'target_user': username,
                            'source_ip': ip,
                            'detected_at': event.timestamp
                        })
                    failures_streak = [] # Reset streak on success
                    
            # Check remaining failures that did not end in success
            if len(failures_streak) >= self.brute_force_threshold:
                # Check timestamps within sliding window
                start_time = failures_streak[0].timestamp
                end_time = failures_streak[-1].timestamp
                
                alerts.append({
                    'alert_type': 'BRUTE_FORCE',
                    'severity': 'HIGH',
                    'title': f'Brute Force Attack Detected: {username}',
                    'description': (f'Detected {len(failures_streak)} consecutive failed login attempts on account "{username}" '
                                    f'from IP address {ip} via {failures_streak[0].auth_service}. Window: {start_time.strftime("%H:%M:%S")} - {end_time.strftime("%H:%M:%S")}.'),
                    'target_user': username,
                    'source_ip': ip,
                    'detected_at': end_time
                })
                
        return alerts

    def _detect_off_hours(self, logs, batch_id):
        alerts = []
        privileged_accounts = {'admin', 'administrator', 'root', 'security_lead', 'sysadmin', 'dbadmin'}
        
        for log in logs:
            hour = log.timestamp.hour
            # Off hours defined as hour >= 22 (10pm) or hour < 5 (5am)
            is_off_hour = (hour >= self.off_hours[0] or hour < self.off_hours[1])
            
            if is_off_hour:
                is_privileged = log.username.lower() in privileged_accounts
                severity = 'HIGH' if is_privileged else 'MEDIUM'
                status_desc = 'Successful' if log.status == 'SUCCESS' else 'Failed'
                
                alerts.append({
                    'alert_type': 'OFF_HOURS',
                    'severity': severity,
                    'title': f'Suspicious Off-Hours Authentication: {log.username}',
                    'description': (f'{status_desc} login attempt occurred at {log.timestamp.strftime("%Y-%m-%d %H:%M:%S")} (Off-hours window) '
                                    f'for user "{log.username}" from {log.ip_address} ({log.location}) via {log.auth_service}.'
                                    f'{" [PRIVILEGED ACCOUNT ALERT]" if is_privileged else ""}'),
                    'target_user': log.username,
                    'source_ip': log.ip_address,
                    'detected_at': log.timestamp
                })
        return alerts

    def _detect_password_spray(self, logs, batch_id):
        alerts = []
        # Group logs by IP address
        ip_events = defaultdict(list)
        for log in logs:
            if log.status == 'FAILURE':
                ip_events[log.ip_address].append(log)
                
        for ip, fail_logs in ip_events.items():
            # Check unique users targeted within sliding window
            for i in range(len(fail_logs)):
                window_logs = [l for l in fail_logs if 0 <= (l.timestamp - fail_logs[i].timestamp).total_seconds() <= self.spray_window.total_seconds()]
                unique_users = set(l.username for l in window_logs)
                
                if len(unique_users) >= self.spray_user_threshold:
                    target_list = ", ".join(list(unique_users)[:5])
                    alerts.append({
                        'alert_type': 'ACCOUNT_SPRAY',
                        'severity': 'HIGH',
                        'title': f'Password Spray Attack From {ip}',
                        'description': (f'IP address {ip} attempted failed logins across {len(unique_users)} distinct user accounts '
                                        f'({target_list}...) within {self.spray_window.seconds//60} minutes. Typical horizontal reconnaissance pattern.'),
                        'target_user': 'Multiple Accounts',
                        'source_ip': ip,
                        'detected_at': window_logs[-1].timestamp
                    })
                    break # One alert per IP window is sufficient
                    
        return alerts
