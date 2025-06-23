from flask import Blueprint, request, jsonify, send_file
from model.models import db, Kuitansi, User, RoleEnum
from datetime import datetime
from io import BytesIO
import jwt
import os
from functools import wraps
import logging

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import Color
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Blueprint configuration
kuitansi_bp = Blueprint('kuitansi_bp', __name__)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev_secret_key_not_for_production")
DEV_TOKEN = os.environ.get("DEV_TOKEN", "dev_access_token_for_testing")
DEV_MODE = os.environ.get("DEV_MODE", "True").lower() == "true"


def token_required(f):
    """JWT token authentication decorator"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Extract from header OR query string
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid Authorization header format. Use "Bearer <token>"'
                }), 401
        elif 'token' in request.args:
            token = request.args.get('token')

        if not token:
            return jsonify({
                'status': 'error', 
                'message': 'Token not found'
            }), 401

        # Development mode bypass
        if DEV_MODE and token == DEV_TOKEN:
            dev_user = User(
                id_user=1,
                nama="Developer",
                email_nik="dev@example.com",
                password="",
                role=RoleEnum.ISE
            )
            return f(dev_user, *args, **kwargs)

        try:
            # Decode and validate token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id_user=data['id_user']).first()

            if not current_user:
                return jsonify({
                    'status': 'error', 
                    'message': 'User not found'
                }), 404

        except jwt.ExpiredSignatureError:
            return jsonify({
                'status': 'error', 
                'message': 'Token has expired'
            }), 401
        except jwt.DecodeError:
            return jsonify({
                'status': 'error',
                'message': 'Invalid token',
                'error': 'Token structure is incomplete or corrupted'
            }), 401
        except jwt.InvalidTokenError as e:
            return jsonify({
                'status': 'error',
                'message': 'Invalid token',
                'error': str(e)
            }), 401
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Error verifying token',
                'error': str(e)
            }), 500

        return f(current_user, *args, **kwargs)

    return decorated


def serialize_kuitansi(kuitansi):
    """Helper function to serialize kuitansi object"""
    return {
        "id_kuitansi": kuitansi.id_kuitansi,
        "nomor_kuitansi": kuitansi.nomor_kuitansi,
        "nama": kuitansi.nama,
        "tanggal": kuitansi.tanggal.strftime('%Y-%m-%d'),
        "jumlah": kuitansi.jumlah,
        "terbilang": kuitansi.terbilang,
        "deskripsi": kuitansi.deskripsi,
        "id_user": kuitansi.id_user
    }


def validate_date(date_string):
    """Helper function to validate and parse date"""
    try:
        return datetime.strptime(date_string, '%Y-%m-%d').date()
    except ValueError:
        raise ValueError("Invalid date format. Use YYYY-MM-DD")


@kuitansi_bp.route("/all_kuitansi", methods=["GET"])
@token_required
def get_all_kuitansi(current_user):
    """Get all kuitansi records"""
    try:
        kuitansi_list = Kuitansi.query.all()
        return jsonify({
            "status": "success",
            "data": [serialize_kuitansi(k) for k in kuitansi_list]
        }), 200
    except Exception as e:
        logger.error(f"Error getting all kuitansi: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@kuitansi_bp.route("/create_kuitansi", methods=["POST"])
@token_required
def create_kuitansi(current_user):
    """Create new kuitansi (ISE only)"""
    if current_user.role != RoleEnum.ISE:
        return jsonify({
            "status": "error",
            "message": "Hanya ISE yang dapat membuat kuitansi"
        }), 403
        
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['nomor_kuitansi', 'nama', 'tanggal', 'jumlah', 'terbilang', 'deskripsi']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400
        
        # Validate and parse date
        try:
            data['tanggal'] = validate_date(data['tanggal'])
        except ValueError as e:
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 400
        
        # Set user ID and remove auto-increment field
        data['id_user'] = current_user.id_user
        data.pop('id_kuitansi', None)
        
        # Create and save kuitansi
        kuitansi = Kuitansi(**data)
        db.session.add(kuitansi)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Kuitansi created successfully",
            "kuitansi_id": kuitansi.id_kuitansi
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating kuitansi: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@kuitansi_bp.route("/get_kuitansi/<int:id_kuitansi>", methods=["GET"])
@token_required
def get_kuitansi_by_id(current_user, id_kuitansi):
    """Get kuitansi by ID"""
    try:
        kuitansi = Kuitansi.query.get_or_404(id_kuitansi)
        return jsonify({
            "status": "success",
            "data": serialize_kuitansi(kuitansi)
        }), 200
    except Exception as e:
        logger.error(f"Error getting kuitansi {id_kuitansi}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@kuitansi_bp.route("/edit_kuitansi/<int:id_kuitansi>", methods=["PATCH"])
@token_required
def edit_kuitansi(current_user, id_kuitansi):
    """Edit kuitansi (ISE owner or admin only)"""
    try:
        kuitansi = Kuitansi.query.get_or_404(id_kuitansi)
        data = request.json

        # Prevent ID changes
        if 'id_kuitansi' in data:
            return jsonify({
                "status": "error",
                "message": "Kuitansi ID cannot be changed"
            }), 400

        # Role-based access control
        if current_user.role == RoleEnum.ISE:
            if current_user.id_user != kuitansi.id_user:
                return jsonify({
                    "status": "error",
                    "message": "ISE hanya dapat mengedit kuitansi yang dibuat sendiri"
                }), 403
        elif current_user.role == RoleEnum.admin:
            pass  # Admin can edit any kuitansi
        else:
            return jsonify({
                "status": "error",
                "message": "Anda tidak memiliki izin untuk mengedit kuitansi"
            }), 403

        # Track changes
        changes = {}
        for key, value in data.items():
            if hasattr(kuitansi, key) and key not in ['id_kuitansi', 'id_user']:
                old_value = getattr(kuitansi, key)
                
                if key == 'tanggal':
                    try:
                        value = validate_date(value)
                    except ValueError as e:
                        return jsonify({
                            "status": "error",
                            "message": str(e)
                        }), 400
                
                setattr(kuitansi, key, value)
                changes[key] = {
                    "old": old_value.strftime('%Y-%m-%d') if key == 'tanggal' else str(old_value),
                    "new": value.strftime('%Y-%m-%d') if key == 'tanggal' else str(value)
                }

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Kuitansi successfully updated",
            "kuitansi_id": id_kuitansi,
            "changes": changes
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error editing kuitansi {id_kuitansi}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@kuitansi_bp.route("/delete/<int:id_kuitansi>", methods=["DELETE"])
@token_required
def delete_kuitansi(current_user, id_kuitansi):
    """Delete kuitansi (admin and off3so only)"""
    if current_user.role not in [RoleEnum.admin, RoleEnum.off3so]:
        return jsonify({
            "status": "error",
            "message": "Hanya admin dan off3so yang dapat menghapus kuitansi"
        }), 403
        
    try:
        kuitansi = Kuitansi.query.get_or_404(id_kuitansi)
        
        db.session.delete(kuitansi)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Kuitansi successfully deleted"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting kuitansi {id_kuitansi}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@kuitansi_bp.route("/download_kuitansi/<int:id_kuitansi>", methods=["GET"])
@token_required
def download_kuitansi(current_user, id_kuitansi):
    """Download single kuitansi (admin and off3so only)"""
    if current_user.role not in [RoleEnum.admin, RoleEnum.off3so]:
        return jsonify({
            "status": "error",
            "message": "Hanya admin dan off3so yang dapat mendownload kuitansi"
        }), 403
        
    try:
        kuitansi = Kuitansi.query.get_or_404(id_kuitansi)
        
        data = serialize_kuitansi(kuitansi)
        data.update({
            "downloaded_by": current_user.nama,
            "download_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
        return jsonify({
            "status": "success",
            "message": "Kuitansi data retrieved for download",
            "data": data
        }), 200
        
    except Exception as e:
        logger.error(f"Error downloading kuitansi {id_kuitansi}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@kuitansi_bp.route("/download_all_kuitansi", methods=["GET"])
@token_required
def download_all_kuitansi(current_user):
    """Download all kuitansi (admin and off3so only)"""
    if current_user.role not in [RoleEnum.admin, RoleEnum.off3so]:
        return jsonify({
            "status": "error",
            "message": "Hanya admin dan off3so yang dapat mendownload semua kuitansi"
        }), 403
        
    try:
        kuitansi_list = Kuitansi.query.all()
        
        return jsonify({
            "status": "success",
            "message": "All kuitansi data retrieved for download",
            "total_records": len(kuitansi_list),
            "downloaded_by": current_user.nama,
            "download_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "data": [serialize_kuitansi(k) for k in kuitansi_list]
        }), 200
        
    except Exception as e:
        logger.error(f"Error downloading all kuitansi: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@kuitansi_bp.route("/cetak_pdf/<int:id_kuitansi>", methods=["GET"])
@token_required
def cetak_pdf_kuitansi(current_user, id_kuitansi):
    """Generate PDF for kuitansi"""
    try:
        kuitansi = Kuitansi.query.get_or_404(id_kuitansi)

        # Role-based access control
        if (current_user.role not in [RoleEnum.admin, RoleEnum.off3so] and 
            current_user.id_user != kuitansi.id_user):
            return jsonify({
                "status": "error",
                "message": "Anda tidak memiliki izin untuk mencetak kuitansi ini"
            }), 403

        # Create PDF buffer
        buffer = BytesIO()
        
        # Create PDF canvas
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Add watermark logos (diagonal pattern, full page)
        logo_path = "logo_telkom.png"
        if os.path.exists(logo_path):
            try:
                pdf.saveState()
                pdf.setFillAlpha(0.1) # 10% opacity for watermark
                pdf.rotate(45) # Rotate 45 degrees for diagonal pattern
                
                # Adjust logo size and spacing to fill the entire page with large logos
                logo_size = 150  
                spacing_x = 170  
                spacing_y = 170  

                # Adjust start and end points to ensure full page coverage when rotated
                start_x = -width
                start_y = -height
                end_x = 2 * width
                end_y = 2 * height
                
                # Loop to create a grid of diagonal logos across the entire page
                y = start_y
                while y < end_y:
                    x = start_x
                    while x < end_x:
                        try:
                            pdf.drawImage(logo_path, x, y, 
                                          width=logo_size, height=logo_size, 
                                          mask='auto', preserveAspectRatio=True)
                        except Exception as img_e:
                            logger.error(f"Error drawing image at ({x}, {y}) with size {logo_size}: {img_e}")
                            pass 
                        x += spacing_x
                    y += spacing_y
                
                pdf.restoreState() # Reset transparency and rotation
            except Exception as e:
                logger.error(f"Failed to apply watermark: {e}")
                pass # If logo fails, proceed without watermark

        # Helper functions
        def format_currency(amount):
            return f"Rp {int(amount):,}".replace(',', '.')

        def format_date_indonesian(date_obj):
            months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ]
            return f"{date_obj.day} {months[date_obj.month - 1]} {date_obj.year}"

        # Current position tracker - start higher for title
        y_pos = height - 80

        # Title with blue background (matching image style)
        pdf.setFillColor(Color(0.2, 0.4, 0.6))  # Blue color
        pdf.rect(40, y_pos - 25, width - 80, 35, fill=True, stroke=False)
        
        # Title text in white
        pdf.setFillColor(Color(1, 1, 1))  # White text
        pdf.setFont("Helvetica-Bold", 14)
        text = "KUITANSI PEMBAYARAN"
        text_width = pdf.stringWidth(text, "Helvetica-Bold", 14)
        pdf.drawString((width - text_width) / 2, y_pos - 15, text)
        
        # Reset color to black for rest of content
        pdf.setFillColor(Color(0, 0, 0))
        y_pos -= 45

        # Border for kuitansi number
        pdf.setStrokeColor(Color(0.2, 0.4, 0.6))
        pdf.rect(50, y_pos - 25, width - 100, 25, fill=False, stroke=True)
        
        # No. Kuitansi inside border
        pdf.setFont("Helvetica-Bold", 12)
        no_kuitansi_text = f"No. Kuitansi: {kuitansi.nomor_kuitansi}"
        pdf.drawString(60, y_pos - 18, no_kuitansi_text)
        y_pos -= 50

        # Main content area
        pdf.setFont("Helvetica", 11)
        left_margin = 80
        label_width = 140
        
        # Telah Diterima Dari
        pdf.drawString(left_margin, y_pos, "Telah Diterima Dari")
        pdf.drawString(left_margin + label_width, y_pos, f": {kuitansi.nama}")
        y_pos -= 25
        
        # Tanggal Pembayaran
        pdf.drawString(left_margin, y_pos, "Tanggal Pembayaran")
        pdf.drawString(left_margin + label_width, y_pos, f": {format_date_indonesian(kuitansi.tanggal)}")
        y_pos -= 25
        
        # Jumlah Pembayaran
        pdf.drawString(left_margin, y_pos, "Jumlah Pembayaran")
        pdf.setFont("Helvetica-Bold", 11)
        pdf.setFillColor(Color(0.8, 0, 0))  # Red color for amount
        pdf.drawString(left_margin + label_width, y_pos, f": {format_currency(kuitansi.jumlah)}")
        pdf.setFillColor(Color(0, 0, 0))  # Reset to black
        y_pos -= 25
        
        # Terbilang
        pdf.setFont("Helvetica", 11)
        pdf.drawString(left_margin, y_pos, "Terbilang")
        
        terbilang_text = f": {kuitansi.terbilang} Rupiah"
        # Word wrap for terbilang_text
        lines_terbilang = []
        words_terbilang = terbilang_text.split()
        current_line_terbilang = ""
        max_width = width - left_margin - label_width - 60
        
        for word in words_terbilang:
            test_line = current_line_terbilang + " " + word if current_line_terbilang else word
            if pdf.stringWidth(test_line, "Helvetica", 11) < max_width:
                current_line_terbilang = test_line
            else:
                if current_line_terbilang:
                    lines_terbilang.append(current_line_terbilang)
                current_line_terbilang = word
        if current_line_terbilang:
            lines_terbilang.append(current_line_terbilang)

        for i, line in enumerate(lines_terbilang):
            x_pos = left_margin + label_width if i == 0 else left_margin + label_width
            pdf.drawString(x_pos, y_pos, line)
            y_pos -= 18
        y_pos -= 7  # Extra spacing after terbilang
        
        # Untuk Pembayaran
        pdf.drawString(left_margin, y_pos, "Untuk Pembayaran")
        
        desc_text = f": {kuitansi.deskripsi}"
        # Word wrap for desc_text
        lines_desc = []
        words_desc = desc_text.split()
        current_line_desc = ""
        
        for word in words_desc:
            test_line = current_line_desc + " " + word if current_line_desc else word
            if pdf.stringWidth(test_line, "Helvetica", 11) < max_width:
                current_line_desc = test_line
            else:
                if current_line_desc:
                    lines_desc.append(current_line_desc)
                current_line_desc = word
        if current_line_desc:
            lines_desc.append(current_line_desc)

        for i, line in enumerate(lines_desc):
            x_pos = left_margin + label_width if i == 0 else left_margin + label_width
            pdf.drawString(x_pos, y_pos, line)
            y_pos -= 18
        y_pos -= 20

        # Total box (similar to image)
        pdf.setStrokeColor(Color(0, 0, 0))
        pdf.rect(50, y_pos - 30, width - 100, 30, fill=False, stroke=True)
        
        pdf.setFont("Helvetica-Bold", 12)
        total_text = f"TOTAL PEMBAYARAN: {format_currency(kuitansi.jumlah)}"
        total_width = pdf.stringWidth(total_text, "Helvetica-Bold", 12)
        pdf.drawString((width - total_width) / 2, y_pos - 20, total_text)
        y_pos -= 60

        # Signature area - only "Petugas" (right side)
        now = datetime.now()
        right_margin = width - 80
        
        # Date and City
        date_city_text = f"Makassar, {format_date_indonesian(now)}"
        date_city_width = pdf.stringWidth(date_city_text, "Helvetica", 11)
        pdf.drawString(right_margin - date_city_width, y_pos, date_city_text)
        y_pos -= 25
        
        # Get the user who created the kuitansi
        creator_user = User.query.get(kuitansi.id_user)
        creator_name = creator_user.nama if creator_user else "Unknown User"
        
        # Petugas label
        pdf.setFont("Helvetica", 11)
        petugas_label = "Yang Menerima,"
        petugas_label_width = pdf.stringWidth(petugas_label, "Helvetica", 11)
        pdf.drawString(right_margin - petugas_label_width, y_pos, petugas_label)
        y_pos -= 60  # Space for signature
        
        # # Signature line for petugas
        # line_width = 150
        # pdf.line(right_margin - line_width, y_pos, right_margin, y_pos)
        # y_pos -= 15
        
        # Name of the Petugas (who created the kuitansi)
        pdf.setFont("Helvetica", 11)
        petugas_name = f"{creator_name}"
        petugas_name_width = pdf.stringWidth(petugas_name, "Helvetica", 11)
        pdf.drawString(right_margin - petugas_name_width, y_pos, petugas_name)

        # Footer information
        footer_y_start = 120
        pdf.setFont("Helvetica", 8)
        pdf.setFillColor(Color(0.5, 0.5, 0.5))  # Grey color for footer

        # Left side footer info
        pdf.drawString(60, footer_y_start, f"Dokumen ini dicetak oleh: {current_user.nama}")
        pdf.drawString(60, footer_y_start - 12, f"Tanggal cetak: {datetime.now().strftime('%d %B %Y pukul %H:%M:%S')} WITA")
        pdf.drawString(60, footer_y_start - 24, "Sistem: Aplikasi Kuitansi Digital PT. Telkom Indonesia (Persero) Tbk.")
        
        # Bottom center - document validity note
        validity_text = "Dokumen ini dibuat secara elektronik dan sah tanpa tanda tangan basah."
        validity_width = pdf.stringWidth(validity_text, "Helvetica", 8)
        pdf.drawString((width - validity_width) / 2, footer_y_start - 50, validity_text)

        # Validation code at bottom center
        pdf.setFont("Helvetica-Bold", 8)
        pdf.setFillColor(Color(0.3, 0.3, 0.3))
        validation_code_date = kuitansi.tanggal.strftime('%Y%m%d')
        validation_text = f"Kode Validasi: {kuitansi.nomor_kuitansi}-{validation_code_date}"
        validation_width = pdf.stringWidth(validation_text, "Helvetica-Bold", 8)
        pdf.drawString((width - validation_width) / 2, 30, validation_text)

        # Finalize PDF
        pdf.save()
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"kuitansi_{kuitansi.nomor_kuitansi}_{now.strftime('%Y%m%d_%H%M%S')}.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        logger.error(f"Error generating PDF for kuitansi {id_kuitansi}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Gagal membuat PDF: {str(e)}"
        }), 500