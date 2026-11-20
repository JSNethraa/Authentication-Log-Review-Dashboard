import os
from flask import Blueprint, request, jsonify
from models import db, AuthLog, LogBatch
from services.log_parser import LogParserService
from services.detector import DetectionEngine
from routes.auth import token_required

logs_bp = Blueprint('logs', __name__)

@logs_bp.route('/upload', methods=['POST'])
@token_required
def upload_logs(current_user):
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported'}), 400
        
    batch, count, error = LogParserService.parse_csv_stream(
        file.stream,
        file.filename,
        analyst_username=current_user.username
    )
    
    if error:
        return jsonify({'error': error}), 400
        
    # Trigger detection automatically on the new batch
    detector = DetectionEngine()
    alerts_triggered = detector.run_detection(batch_id=batch.id)
    
    return jsonify({
        'message': f'Successfully ingested {count} authentication records.',
        'batch': batch.to_dict(),
        'alerts_triggered': alerts_triggered
    }), 201

@logs_bp.route('/sample-load', methods=['POST'])
@token_required
def load_sample_dataset(current_user):
    sample_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sample_data', 'auth_logs_sample.csv')
    if not os.path.exists(sample_path):
        return jsonify({'error': 'Sample dataset file not found on server.'}), 404
        
    with open(sample_path, 'rb') as f:
        batch, count, error = LogParserService.parse_csv_stream(
            f,
            'auth_logs_sample.csv',
            analyst_username=current_user.username
        )
        
    if error:
        return jsonify({'error': error}), 400
        
    detector = DetectionEngine()
    alerts_count = detector.run_detection(batch_id=batch.id)
    
    return jsonify({
        'message': f'Demo security logs loaded successfully ({count} records).',
        'batch': batch.to_dict(),
        'alerts_triggered': alerts_count
    })

@logs_bp.route('', methods=['GET'])
@token_required
def get_logs(current_user):
    # Query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)
    per_page = min(per_page, 200) # Safeguard
    
    search = request.args.get('search', '').strip()
    status = request.args.get('status', '').strip().upper()
    service = request.args.get('service', '').strip()
    username = request.args.get('username', '').strip()
    ip = request.args.get('ip', '').strip()
    
    query = AuthLog.query
    
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (AuthLog.username.ilike(search_fmt)) |
            (AuthLog.ip_address.ilike(search_fmt)) |
            (AuthLog.failure_reason.ilike(search_fmt)) |
            (AuthLog.location.ilike(search_fmt))
        )
    if status in ['SUCCESS', 'FAILURE']:
        query = query.filter_by(status=status)
    if service:
        query = query.filter(AuthLog.auth_service.ilike(f"%{service}%"))
    if username:
        query = query.filter(AuthLog.username.ilike(f"%{username}%"))
    if ip:
        query = query.filter(AuthLog.ip_address.ilike(f"%{ip}%"))
        
    total_records = query.count()
    logs = query.order_by(AuthLog.timestamp.desc()).offset((page - 1) * per_page).limit(per_page).all()
    
    return jsonify({
        'total': total_records,
        'page': page,
        'per_page': per_page,
        'total_pages': (total_records + per_page - 1) // per_page if total_records > 0 else 1,
        'logs': [log.to_dict() for log in logs]
    })

@logs_bp.route('/batches', methods=['GET'])
@token_required
def get_batches(current_user):
    batches = LogBatch.query.order_by(LogBatch.uploaded_at.desc()).all()
    return jsonify({'batches': [b.to_dict() for b in batches]})
