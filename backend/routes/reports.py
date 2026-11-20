from flask import Blueprint, send_file, Response
from services.report_generator import ReportGeneratorService
from routes.auth import token_required

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/download-pdf', methods=['GET'])
@token_required
def download_pdf_report(current_user):
    pdf_buffer = ReportGeneratorService.generate_pdf_report()
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name='SOC_Authentication_Security_Audit_Report.pdf'
    )

@reports_bp.route('/download-csv', methods=['GET'])
@token_required
def download_csv_report(current_user):
    csv_data = ReportGeneratorService.generate_csv_export()
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=auth_forensic_logs_export.csv'}
    )
