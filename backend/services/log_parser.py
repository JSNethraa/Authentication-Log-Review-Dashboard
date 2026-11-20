import csv
import io
from datetime import datetime
from dateutil import parser
from models import db, AuthLog, LogBatch

class LogParserService:
    @staticmethod
    def parse_csv_stream(file_stream, filename, analyst_username='system'):
        """
        Parses CSV input stream into AuthLog models and commits to database.
        Returns a tuple: (batch_model, count_inserted, error_message)
        """
        try:
            content = file_stream.read()
            if isinstance(content, bytes):
                content = content.decode('utf-8', errors='replace')
                
            stream = io.StringIO(content)
            reader = csv.DictReader(stream)
            
            # Normalize headers (lowercase and strip whitespace)
            if not reader.fieldnames:
                return None, 0, "CSV file is empty or missing headers."
                
            header_map = {name.strip().lower(): name for name in reader.fieldnames}
            
            # Required columns
            req = ['timestamp', 'username', 'ip_address', 'status']
            missing = [c for c in req if not any(c in h for h in header_map)]
            if missing:
                return None, 0, f"Missing required column headers: {', '.join(missing)}"
                
            # Create Log Batch
            batch = LogBatch(
                filename=filename,
                total_records=0,
                uploaded_by=analyst_username,
                uploaded_at=datetime.utcnow()
            )
            db.session.add(batch)
            db.session.flush() # get batch.id
            
            logs_to_insert = []
            
            for row in reader:
                # Resolve field values with fallback
                def get_val(keys, default=''):
                    for k in keys:
                        for h in header_map:
                            if k == h or k in h:
                                val = row.get(header_map[h])
                                if val is not None and str(val).strip():
                                    return str(val).strip()
                    return default

                raw_ts = get_val(['timestamp', 'date_time', 'time', 'datetime'])
                username = get_val(['username', 'user', 'account', 'login'])
                ip = get_val(['ip_address', 'ip', 'source_ip', 'host'], '127.0.0.1')
                status = get_val(['status', 'auth_status', 'result', 'action'], 'FAILURE').upper()
                service = get_val(['service', 'auth_service', 'protocol', 'app'], 'Web-Portal')
                reason = get_val(['reason', 'failure_reason', 'message', 'error'], '')
                location = get_val(['location', 'country', 'city', 'geo'], 'Internal / Unknown')
                user_agent = get_val(['user_agent', 'agent', 'client'], 'Mozilla/5.0 (Windows NT 10.0; Win64)')
                
                # Parse timestamp
                try:
                    ts = parser.parse(raw_ts)
                except Exception:
                    ts = datetime.utcnow()
                    
                # Normalize status
                if 'SUCC' in status or status == 'OK' or status == 'ALLOW':
                    status_clean = 'SUCCESS'
                else:
                    status_clean = 'FAILURE'
                    if not reason:
                        reason = 'Invalid credentials or key'
                        
                log_entry = AuthLog(
                    batch_id=batch.id,
                    timestamp=ts,
                    username=username,
                    ip_address=ip,
                    auth_service=service,
                    status=status_clean,
                    failure_reason=reason if status_clean == 'FAILURE' else None,
                    location=location,
                    user_agent=user_agent
                )
                logs_to_insert.append(log_entry)
                
            if logs_to_insert:
                db.session.bulk_save_objects(logs_to_insert)
                batch.total_records = len(logs_to_insert)
                db.session.commit()
                return batch, len(logs_to_insert), None
            else:
                db.session.rollback()
                return None, 0, "No valid log records found in file."
                
        except Exception as e:
            db.session.rollback()
            return None, 0, f"Error parsing log file: {str(e)}"
