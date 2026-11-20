import io
import csv
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from models import AuthLog, Alert, Investigation

class ReportGeneratorService:
    @staticmethod
    def generate_pdf_report():
        """Generates an executive SOC security audit PDF report"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0f172a'),
            fontName='Helvetica-Bold'
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            leading=14
        )
        heading2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#1e3a8a'),
            fontName='Helvetica-Bold',
            spaceBefore=14,
            spaceAfter=6
        )
        normal_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155')
        )
        alert_desc_style = ParagraphStyle(
            'AlertDesc',
            parent=styles['Normal'],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#1e293b')
        )

        elements = []
        
        # Header banner
        elements.append(Paragraph("CYBERSECURITY INCIDENT & AUTHENTICATION AUDIT REPORT", title_style))
        elements.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Security Operations Center (SOC)", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceBefore=8, spaceAfter=14))
        
        # Summary Statistics
        total_logs = AuthLog.query.count()
        failed_logs = AuthLog.query.filter_by(status='FAILURE').count()
        success_logs = AuthLog.query.filter_by(status='SUCCESS').count()
        total_alerts = Alert.query.count()
        critical_alerts = Alert.query.filter_by(severity='CRITICAL').count()
        high_alerts = Alert.query.filter_by(severity='HIGH').count()
        
        failure_rate = round((failed_logs / total_logs * 100), 2) if total_logs > 0 else 0
        
        elements.append(Paragraph("1. Executive Summary & KPIs", heading2_style))
        kpi_data = [
            ["Metric", "Value", "Security Assessment"],
            ["Total Authentication Events", str(total_logs), "Total Ingested Telemetry"],
            ["Successful Logins", str(success_logs), "Legitimate & Verified Sessions"],
            ["Failed Authentication Attempts", f"{failed_logs} ({failure_rate}%)", "Potential Unauthorized Intrusion Attempts"],
            ["Total Detected Threats", str(total_alerts), "Alert Rules Triggered"],
            ["Critical / High Severity Incidents", f"{critical_alerts} Critical / {high_alerts} High", "Requires Priority SOC Remediation"]
        ]
        
        t_kpi = Table(kpi_data, colWidths=[180, 140, 220])
        t_kpi.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
        ]))
        elements.append(t_kpi)
        elements.append(Spacer(1, 14))
        
        # High & Critical Security Alerts Section
        elements.append(Paragraph("2. Prioritized Security Alerts & Anomalies", heading2_style))
        alerts = Alert.query.order_by(Alert.detected_at.desc()).limit(15).all()
        
        if alerts:
            alert_table_data = [["Severity", "Type", "Target User", "Source IP", "Incident Details", "Status"]]
            for a in alerts:
                sev_color = colors.HexColor('#dc2626') if a.severity == 'CRITICAL' else colors.HexColor('#ea580c') if a.severity == 'HIGH' else colors.HexColor('#ca8a04')
                alert_table_data.append([
                    a.severity,
                    a.alert_type,
                    a.target_user or "N/A",
                    a.source_ip or "N/A",
                    Paragraph(a.title, alert_desc_style),
                    a.status
                ])
                
            t_alerts = Table(alert_table_data, colWidths=[55, 75, 80, 80, 190, 60])
            t_alerts.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 7.5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f1f5f9')])
            ]))
            elements.append(t_alerts)
        else:
            elements.append(Paragraph("No active security alerts recorded.", normal_style))
            
        elements.append(Spacer(1, 14))
        
        # SOC Analyst Audit Trail
        elements.append(Paragraph("3. Recent Analyst Investigation Actions", heading2_style))
        investigations = Investigation.query.order_by(Investigation.created_at.desc()).limit(10).all()
        if investigations:
            inv_table_data = [["Timestamp", "Analyst", "Action Taken", "Investigation Findings"]]
            for inv in investigations:
                inv_table_data.append([
                    inv.created_at.strftime('%Y-%m-%d %H:%M') if inv.created_at else "",
                    inv.analyst_name,
                    inv.action_taken,
                    Paragraph(inv.notes, alert_desc_style)
                ])
            t_inv = Table(inv_table_data, colWidths=[80, 90, 120, 250])
            t_inv.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 7.5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
            ]))
            elements.append(t_inv)
        else:
            elements.append(Paragraph("No investigations logged yet.", normal_style))
            
        elements.append(Spacer(1, 18))
        elements.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94a3b8'), spaceBefore=4, spaceAfter=8))
        elements.append(Paragraph("Confidential - For Internal Security Operations & Compliance Review Only", subtitle_style))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_csv_export():
        """Generates raw forensic CSV export of all authentication events and their flags"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow([
            'Log_ID', 'Timestamp_UTC', 'Username', 'Source_IP', 'Auth_Service',
            'Status', 'Failure_Reason', 'Location', 'User_Agent'
        ])
        
        logs = AuthLog.query.order_by(AuthLog.timestamp.desc()).all()
        for log in logs:
            writer.writerow([
                log.id,
                log.timestamp.strftime('%Y-%m-%d %H:%M:%S') if log.timestamp else '',
                log.username,
                log.ip_address,
                log.auth_service,
                log.status,
                log.failure_reason or '',
                log.location or '',
                log.user_agent or ''
            ])
            
        output.seek(0)
        return output.getvalue()
