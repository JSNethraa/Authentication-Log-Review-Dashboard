from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db, User

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Configure CORS to allow frontend communication with all required headers and methods
    # Supports local development as well as any Vercel deployment preview / production domain
    CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "https://authentication-log-review-dashboard.vercel.app",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ]
        }
    },
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)
    
    # Initialize Database
    db.init_app(app)
    
    # Register API Blueprints
    from routes.auth import auth_bp
    from routes.logs import logs_bp
    from routes.analysis import analysis_bp
    from routes.alerts import alerts_bp
    from routes.investigations import investigations_bp
    from routes.reports import reports_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(logs_bp, url_prefix='/api/logs')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(investigations_bp, url_prefix='/api/investigations')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'service': 'Authentication Log Review Dashboard Backend',
            'status': 'operational',
            'health_check': '/api/health',
            'version': '1.0.0'
        })

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'operational',
            'service': 'Authentication Log Review Backend',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'connected'
        })
        
    # Database initialization hook
    with app.app_context():
        db.create_all()
        # Seed or refresh default SOC analyst credentials
        analyst = User.query.filter_by(username='analyst').first()
        if not analyst:
            demo_user = User(
                username='analyst',
                email='analyst@soc-defense.io',
                role='senior_analyst'
            )
            demo_user.set_password('Analyst123!')
            db.session.add(demo_user)
            db.session.commit()
            print("Default SOC Analyst created: analyst / Analyst123!")
        else:
            # Ensure the password hash for 'analyst' always matches 'Analyst123!'
            # in case an old database instance had a different or corrupted hash
            if not analyst.check_password('Analyst123!'):
                analyst.set_password('Analyst123!')
                db.session.commit()
                print("Default SOC Analyst password synced: analyst / Analyst123!")
            
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
