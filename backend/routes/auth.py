from functools import wraps
from flask import Blueprint, request, jsonify, current_app
import jwt
from datetime import datetime, timezone
from models import db, User

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'error': 'Authentication token is required.'}), 401
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'Analyst account no longer exists.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Session expired. Please log in again.'}), 401
        except Exception:
            return jsonify({'error': 'Invalid authentication token.'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'analyst')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required.'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username is already registered.'}), 409
        
    user = User(username=username, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Analyst account created successfully.', 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    # Accept case-insensitive or trimmed username
    raw_username = data.get('username') or data.get('user') or ''
    username = str(raw_username).strip()
    password = data.get('password') or ''
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required.'}), 400
        
    user = User.query.filter(User.username.ilike(username)).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or credentials.'}), 401
        
    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.now(timezone.utc) + current_app.config['JWT_EXPIRATION']
    }, current_app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    })

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({'user': current_user.to_dict()})
