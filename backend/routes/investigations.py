from flask import Blueprint, request, jsonify
from models import db, Investigation, Alert
from routes.auth import token_required

investigations_bp = Blueprint('investigations', __name__)

@investigations_bp.route('', methods=['GET'])
@token_required
def get_investigations(current_user):
    alert_id = request.args.get('alert_id', type=int)
    query = Investigation.query
    if alert_id:
        query = query.filter_by(alert_id=alert_id)
        
    records = query.order_by(Investigation.created_at.desc()).all()
    
    # Enrich with alert title if available
    result = []
    for r in records:
        d = r.to_dict()
        if r.alert_id:
            alert = Alert.query.get(r.alert_id)
            d['alert_title'] = alert.title if alert else "Unknown Alert"
            d['alert_severity'] = alert.severity if alert else "INFO"
        else:
            d['alert_title'] = "General Security Investigation"
            d['alert_severity'] = "INFO"
        result.append(d)
        
    return jsonify({'investigations': result})

@investigations_bp.route('', methods=['POST'])
@token_required
def create_investigation(current_user):
    data = request.get_json() or {}
    alert_id = data.get('alert_id')
    action_taken = data.get('action_taken', '').strip()
    notes = data.get('notes', '').strip()
    
    if not action_taken or not notes:
        return jsonify({'error': 'Action taken and investigation notes are required.'}), 400
        
    inv = Investigation(
        alert_id=alert_id,
        analyst_name=current_user.username,
        action_taken=action_taken,
        notes=notes
    )
    db.session.add(inv)
    
    # If linked to an alert, optionally update alert status
    new_status = data.get('new_status')
    if alert_id and new_status:
        alert = Alert.query.get(alert_id)
        if alert:
            alert.status = new_status
            
    db.session.commit()
    return jsonify({'message': 'Investigation record created.', 'investigation': inv.to_dict()}), 201
