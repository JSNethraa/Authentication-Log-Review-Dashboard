from flask import Blueprint, jsonify
from sqlalchemy import func, case
from models import db, AuthLog, Alert, Investigation
from routes.auth import token_required

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/overview', methods=['GET'])
@token_required
def get_overview_statistics(current_user):
    # Total counts
    total_logs = AuthLog.query.count()
    success_logs = AuthLog.query.filter_by(status='SUCCESS').count()
    failed_logs = AuthLog.query.filter_by(status='FAILURE').count()
    
    failure_rate = round((failed_logs / total_logs * 100), 1) if total_logs > 0 else 0
    
    total_alerts = Alert.query.count()
    active_alerts = Alert.query.filter(Alert.status.in_(['OPEN', 'IN_REVIEW'])).count()
    critical_alerts = Alert.query.filter_by(severity='CRITICAL').count()
    high_alerts = Alert.query.filter_by(severity='HIGH').count()
    resolved_alerts = Alert.query.filter_by(status='RESOLVED').count()
    
    # Severity distribution
    sev_counts = db.session.query(Alert.severity, func.count(Alert.id)).group_by(Alert.severity).all()
    severity_distribution = {s[0]: s[1] for s in sev_counts}
    
    # Alert type distribution
    type_counts = db.session.query(Alert.alert_type, func.count(Alert.id)).group_by(Alert.alert_type).all()
    alert_type_distribution = [{'type': t[0], 'count': t[1]} for t in type_counts]
    
    # Service distribution
    service_counts = db.session.query(AuthLog.auth_service, func.count(AuthLog.id)).group_by(AuthLog.auth_service).all()
    service_distribution = [{'service': s[0], 'count': s[1]} for s in service_counts]
    
    # Top 5 Targeted Users
    top_targets = db.session.query(
        AuthLog.username,
        func.count(AuthLog.id).label('total_attempts'),
        func.sum(case((AuthLog.status == 'FAILURE', 1), else_=0)).label('failed_attempts')
    ).group_by(AuthLog.username).order_by(func.count(AuthLog.id).desc()).limit(5).all()
    
    top_targeted_users = [
        {'username': t[0], 'total': t[1], 'failed': int(t[2] or 0)}
        for t in top_targets
    ]
    
    # Top 5 Malicious / Active IPs
    top_ips = db.session.query(
        AuthLog.ip_address,
        AuthLog.location,
        func.count(AuthLog.id).label('total_attempts'),
        func.sum(case((AuthLog.status == 'FAILURE', 1), else_=0)).label('failed_attempts')
    ).group_by(AuthLog.ip_address, AuthLog.location).order_by(func.count(AuthLog.id).desc()).limit(5).all()
    
    top_active_ips = [
        {'ip': ip[0], 'location': ip[1], 'total': ip[2], 'failed': int(ip[3] or 0)}
        for ip in top_ips
    ]
    
    # Activity Timeline (grouped by hourly buckets or sequential logs)
    # Get last 20 logs for quick timeline visualization
    recent_activity = db.session.query(
        func.strftime('%Y-%m-%d %H:00', AuthLog.timestamp).label('hour_bucket'),
        func.sum(case((AuthLog.status == 'SUCCESS', 1), else_=0)).label('success'),
        func.sum(case((AuthLog.status == 'FAILURE', 1), else_=0)).label('failure')
    ).group_by('hour_bucket').order_by('hour_bucket').all()
    
    timeline_data = [
        {'time': r[0], 'success': int(r[1] or 0), 'failure': int(r[2] or 0)}
        for r in recent_activity
    ]
    
    return jsonify({
        'kpi': {
            'total_logs': total_logs,
            'success_logs': success_logs,
            'failed_logs': failed_logs,
            'failure_rate': failure_rate,
            'total_alerts': total_alerts,
            'active_alerts': active_alerts,
            'critical_alerts': critical_alerts,
            'high_alerts': high_alerts,
            'resolved_alerts': resolved_alerts
        },
        'severity_distribution': severity_distribution,
        'alert_type_distribution': alert_type_distribution,
        'service_distribution': service_distribution,
        'top_targeted_users': top_targeted_users,
        'top_active_ips': top_active_ips,
        'timeline': timeline_data
    })
