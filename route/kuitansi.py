from flask import Blueprint, request, jsonify, send_file
from model.models import db, Kuitansi, User, RoleEnum
from datetime import datetime
from fpdf import FPDF
from io import BytesIO
from math import cos, sin, radians
import jwt
import os
from functools import wraps
import logging

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

        # Create PDF with better formatting
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.set_margins(15, 15, 15)

        # Add logo if exists
        logo_path = "logo_indibiz.png"
        if os.path.exists(logo_path):
            pdf.image(logo_path, x=15, y=15, w=35, h=25)

        # Company header with better spacing
        pdf.set_y(20)
        pdf.set_x(60)
        pdf.set_font("Arial", 'B', 18)
        pdf.set_text_color(0, 100, 150)  # Corporate blue
        pdf.cell(0, 10, "PT. TELKOM INDONESIA", ln=True, align='L')
        
        pdf.set_x(60)
        pdf.set_font("Arial", '', 12)
        pdf.set_text_color(80, 80, 80)  # Dark gray
        pdf.cell(0, 6, "Jl. Telekomunikasi No. 1, Bandung 40257", ln=True, align='L')
        
        pdf.set_x(60)
        pdf.cell(0, 6, "Telp: (022) 1234567 | Fax: (022) 1234568", ln=True, align='L')
        
        pdf.set_x(60)
        pdf.cell(0, 6, "Email: info@telkom.co.id | www.telkom.co.id", ln=True, align='L')
        
        pdf.ln(10)

        # Decorative separator line
        pdf.set_draw_color(0, 100, 150)
        pdf.set_line_width(1.5)
        pdf.line(15, pdf.get_y(), 195, pdf.get_y())
        pdf.set_line_width(0.5)
        pdf.line(15, pdf.get_y() + 2, 195, pdf.get_y() + 2)
        pdf.ln(8)

        # Title with background
        pdf.set_font("Arial", 'B', 16)
        pdf.set_text_color(255, 255, 255)  # White text
        pdf.set_fill_color(0, 100, 150)    # Blue background
        pdf.cell(0, 12, "KUITANSI PEMBAYARAN", ln=True, align='C', fill=True)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.ln(8)

        # Receipt number in a box
        pdf.set_font("Arial", 'B', 12)
        pdf.set_draw_color(0, 100, 150)
        pdf.rect(15, pdf.get_y(), 180, 10)
        pdf.set_x(20)
        pdf.cell(0, 10, f"No. Kuitansi: {kuitansi.nomor_kuitansi}", ln=True, align='L')
        pdf.ln(8)

        # Helper function for label-value pairs with better formatting
        def add_label_value(label, value, is_amount=False):
            current_y = pdf.get_y()
            
            # Label column
            pdf.set_font("Arial", 'B', 11)
            pdf.set_text_color(60, 60, 60)
            pdf.set_xy(20, current_y)
            pdf.cell(50, 8, label, 0, 0, 'L')
            
            # Colon
            pdf.set_font("Arial", '', 11)
            pdf.cell(5, 8, ":", 0, 0, 'L')
            
            # Value column with special formatting for amount
            if is_amount:
                pdf.set_font("Arial", 'B', 12)
                pdf.set_text_color(200, 0, 0)  # Red for amount
            else:
                pdf.set_font("Arial", '', 11)
                pdf.set_text_color(0, 0, 0)
            
            # Handle long text wrapping
            if len(str(value)) > 80:
                pdf.set_xy(75, current_y)
                pdf.multi_cell(115, 8, str(value), 0, 'L')
                pdf.ln(2)
            else:
                pdf.cell(0, 8, str(value), 0, 1, 'L')
                pdf.ln(3)

        # Format date in Indonesian
        def format_date_indonesian(date_obj):
            months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ]
            return f"{date_obj.day} {months[date_obj.month - 1]} {date_obj.year}"

        # Format currency
        def format_currency(amount):
            return f"Rp {int(amount):,}".replace(',', '.')

        # Receipt content with better formatting
        add_label_value("Telah Diterima Dari", kuitansi.nama)
        add_label_value("Tanggal Pembayaran", format_date_indonesian(kuitansi.tanggal))
        add_label_value("Jumlah Pembayaran", format_currency(kuitansi.jumlah), is_amount=True)
        add_label_value("Terbilang", f"{kuitansi.terbilang} Rupiah")
        add_label_value("Untuk Pembayaran", kuitansi.deskripsi)

        # Amount highlight box
        pdf.ln(5)
        pdf.set_font("Arial", 'B', 14)
        pdf.set_fill_color(240, 240, 240)
        pdf.set_draw_color(150, 150, 150)
        pdf.rect(15, pdf.get_y(), 180, 15)
        pdf.set_xy(20, pdf.get_y() + 3)
        pdf.cell(0, 10, f"TOTAL PEMBAYARAN: {format_currency(kuitansi.jumlah)}", 0, 1, 'C')
        pdf.ln(10)

        # Print information section
        pdf.set_font("Arial", 'I', 10)
        pdf.set_text_color(100, 100, 100)
        pdf.ln(5)
        
        # Format current datetime in Indonesian
        now = datetime.now()
        current_date_formatted = format_date_indonesian(now)
        current_time = now.strftime('%H:%M:%S WIB')
        
        pdf.cell(0, 6, f"Dokumen ini dicetak oleh: {current_user.nama}", ln=True, align='L')
        pdf.cell(0, 6, f"Tanggal cetak: {current_date_formatted} pukul {current_time}", ln=True, align='L')
        pdf.cell(0, 6, f"Sistem: Aplikasi Kuitansi Digital PT. Telkom Indonesia", ln=True, align='L')

        # Signature section dengan layout yang lebih compact - DIPERBAIKI
        pdf.ln(8)  # Dikurangi dari 12 ke 8
        pdf.set_text_color(0, 0, 0)
        
        # Cek posisi Y untuk memastikan tidak terlalu dekat dengan bottom
        current_y = pdf.get_y()
        if current_y > 230:  # Threshold dinaikkan untuk memberikan ruang lebih
            pdf.add_page()
            current_y = 30
            pdf.set_y(current_y)
        
        # Two column layout untuk signatures dengan jarak yang lebih rapat
        pdf.set_font("Arial", '', 11)
        
        # Tanggal dan lokasi di kanan atas
        pdf.set_xy(120, current_y)
        pdf.cell(70, 6, f"Bandung, {format_date_indonesian(now)}", 0, 1, 'C')
        
        # Spacing minimal antara tanggal dan label signature
        pdf.ln(2)
        
        # Baris signature dalam satu level Y yang sama
        signature_label_y = pdf.get_y()
        
        # Left column - Penerima
        pdf.set_xy(30, signature_label_y)
        pdf.cell(70, 6, "Penerima,", 0, 0, 'C')
        
        # Right column - Petugas (di posisi Y yang sama)
        pdf.set_xy(120, signature_label_y)
        pdf.cell(70, 6, "Petugas,", 0, 0, 'C')
        
        # Ruang untuk tanda tangan - dikurangi jarak
        pdf.ln(15)  # Dikurangi dari 18 ke 15
        signature_line_y = pdf.get_y()
        
        # Garis signature di kedua kolom pada Y yang sama
        pdf.set_xy(30, signature_line_y)
        pdf.cell(70, 6, "(_________________________)", 0, 0, 'C')
        
        pdf.set_xy(120, signature_line_y)
        pdf.cell(70, 6, "(_________________________)", 0, 0, 'C')
        
        # Nama di bawah garis signature dengan jarak minimal
        pdf.ln(8)  # Dikurangi dari 10 ke 8
        name_y = pdf.get_y()
        
        pdf.set_xy(30, name_y)
        pdf.cell(70, 6, kuitansi.nama, 0, 0, 'C')
        
        pdf.set_xy(120, name_y)
        pdf.cell(70, 6, current_user.nama, 0, 0, 'C')

        # Footer dengan jarak yang proporsional
        pdf.ln(8)  # Dikurangi dari 10 ke 8
        pdf.set_font("Arial", 'I', 8)
        pdf.set_text_color(150, 150, 150)
        pdf.cell(0, 4, "Dokumen ini dibuat secara elektronik dan sah tanpa tanda tangan basah.", ln=True, align='C')
        pdf.cell(0, 4, f"Kode Validasi: {kuitansi.nomor_kuitansi}-{now.strftime('%Y%m%d')}", ln=True, align='C')

        # Add page border
        pdf.set_draw_color(200, 200, 200)
        pdf.rect(10, 10, 190, 277)

        # Generate PDF output
        pdf_output = pdf.output(dest='S').encode('latin1')
        buffer = BytesIO(pdf_output)
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