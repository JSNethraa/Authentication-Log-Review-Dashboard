from flask import Blueprint, request, jsonify
from models import db, Alert, Investigation
from routes.auth import token_required
from services.detector import DetectionEngine

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('', methods=['GET'])
@token_required
def get_alerts(current_user):
    severity = request.args.get('severity', '').strip().upper()
    status = request.args.get('status', '').strip().upper()
    alert_type = request.args.get('type', '').strip().upper()
    
    query = Alert.query
    if severity:
        query = query.filter_by(severity=severity)
    if status:
        query = query.filter_by(status=status)
    if alert_type:
        query = query.filter_by(alert_type=alert_type)
        
    alerts = query.order_by(Alert.detected_at.desc()).all()
    return jsonify({'alerts': [a.to_dict() for a in alerts]})

@alerts_bp.route('/<int:alert_id>', methods=['GET'])
@token_required
def get_alert_detail(current_user, alert_id):
    alert = Alert.query.get_or_404(alert_id)
    investigations = Investigation.query.filter_by(alert_id=alert_id).order_by(Investigation.created_at.desc()).all()
    return jsonify({
        'alert': alert.to_dict(),
        'investigations': [inv.to_dict() for inv in investigations]
    })

@alerts_bp.route('/<int:alert_id>/status', methods=['PATCH'])
@token_required
def update_alert_status(current_user, alert_id):
    alert = Alert.query.get_or_404(alert_id)
    data = request.get_json() or {}
    new_status = data.get('status', '').upper()
    notes = data.get('notes', 'Status updated by analyst.')
    action = data.get('action_taken', f"Status updated to {new_status}")
    
    valid_statuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'FALSE_POSITIVE']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Status must be one of {valid_statuses}'}), 400
        
    alert.status = new_status
    
    # Record in investigation audit history
    inv = Investigation(
        alert_id=alert.id,
        analyst_name=current_user.username,
        action_taken=action,
        notes=notes
    )
    db.session.add(inv)
    db.session.commit()
    
    return jsonify({
        'message': 'Alert status updated successfully.',
        'alert': alert.to_dict(),
        'investigation': inv.to_dict()
    })

@alerts_bp.route('/run-detection', methods=['POST'])
@token_required
def trigger_detection(current_user):
    detector = DetectionEngine()
    count = detector.run_detection()
    return jsonify({
        'message': f'Detection engine completed. {count} new security alerts generated.'
    })
