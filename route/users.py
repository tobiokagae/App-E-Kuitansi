from flask import Blueprint, request, jsonify, current_app
from model.models import db, User, RoleEnum
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy import text
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import os
from functools import wraps
import logging
import re

# Blueprint configuration
user_bp = Blueprint('user_bp', __name__)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev_secret_key_not_for_production")
DEV_TOKEN = os.environ.get("DEV_TOKEN", "dev_access_token_for_testing")
DEV_MODE = os.environ.get("DEV_MODE", "True").lower() == "true"

# Validation patterns
EMAIL_REGEX = r"^[^@]+@[^@]+\.[^@]+$"
PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
NIK_LENGTH = 6

# Role display mapping
ROLE_DISPLAY_MAP = {
    "admin": "Admin",
    "ISE": "ISE", 
    "off3so": "Officer 3 Sales Operation"
}

# Error messages
ERROR_MESSAGES = {
    "INVALID_AUTH_HEADER": "Invalid Authorization header format. Use 'Bearer <token>'",
    "TOKEN_NOT_FOUND": "Token not found",
    "USER_NOT_FOUND": "User not found",
    "TOKEN_EXPIRED": "Token has expired",
    "INVALID_TOKEN": "Invalid token",
    "ADMIN_ONLY": "Only admins can perform this action",
    "PERMISSION_DENIED": "You don't have permission to perform this action",
    "EMAIL_NIK_EXISTS": "Email/NIK already registered",
    "INVALID_EMAIL_NIK": "Email/NIK format is invalid. Use 6-digit NIK or valid email",
    "INVALID_PASSWORD": "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)",
    "INVALID_ROLE": "Invalid role. Available roles: {roles}",
    "MISSING_FIELD": "Missing required field: {field}",
    "INVALID_CREDENTIALS": "Invalid credentials",
    "NIK_LENGTH_ERROR": "NIK must be exactly 6 digits",
    "ID_CANNOT_CHANGE": "User ID cannot be changed"
}


def token_required(f):
    """JWT token validation decorator"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Extract token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]
            else:
                return jsonify({
                    'status': 'error',
                    'message': ERROR_MESSAGES["INVALID_AUTH_HEADER"]
                }), 401
        
        if not token:
            return jsonify({
                'status': 'error', 
                'message': ERROR_MESSAGES["TOKEN_NOT_FOUND"]
            }), 401
        
        # Development token bypass
        if DEV_MODE and token == DEV_TOKEN:
            dev_user = User(
                id_user=0,
                nama="Developer",
                email_nik="dev@example.com",
                password="",
                role=RoleEnum.admin
            )
            return f(dev_user, *args, **kwargs)
        
        try:
            # Decode and validate token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id_user=data['id_user']).first()
            
            if not current_user:
                return jsonify({
                    'status': 'error', 
                    'message': ERROR_MESSAGES["USER_NOT_FOUND"]
                }), 404
                
        except jwt.ExpiredSignatureError:
            return jsonify({
                'status': 'error', 
                'message': ERROR_MESSAGES["TOKEN_EXPIRED"]
            }), 401
        except (jwt.DecodeError, jwt.InvalidTokenError) as e:
            return jsonify({
                'status': 'error',
                'message': ERROR_MESSAGES["INVALID_TOKEN"],
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


def validate_email_nik(email_nik):
    """Validate email or NIK format"""
    if email_nik.isdigit():
        if len(email_nik) != NIK_LENGTH:
            return False, ERROR_MESSAGES["NIK_LENGTH_ERROR"]
    elif not re.match(EMAIL_REGEX, email_nik):
        return False, ERROR_MESSAGES["INVALID_EMAIL_NIK"]
    return True, None


def validate_password(password):
    """Validate password strength"""
    if not re.match(PASSWORD_REGEX, password):
        return False, ERROR_MESSAGES["INVALID_PASSWORD"]
    return True, None


def validate_role(role_input):
    """Validate and convert role"""
    try:
        if isinstance(role_input, str):
            role_input = role_input.lower()
            role_map = {r.name.lower(): r for r in RoleEnum}
            if role_input in role_map:
                return True, role_map[role_input]
        return False, ERROR_MESSAGES["INVALID_ROLE"].format(
            roles=[r.name for r in RoleEnum]
        )
    except Exception:
        return False, ERROR_MESSAGES["INVALID_ROLE"].format(
            roles=[r.name for r in RoleEnum]
        )


def format_user_data(user):
    """Format user data for response"""
    return {
        "id_user": user.id_user,
        "nama": user.nama,
        "email_nik": user.email_nik,
        "role": ROLE_DISPLAY_MAP.get(user.role.value, user.role.value)
    }


# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@user_bp.route("/login", methods=["POST"])
def login():
    """User login endpoint"""
    try:
        auth = request.json
        
        if not auth or not auth.get('email_nik') or not auth.get('password'):
            return jsonify({
                "status": "error",
                "message": ERROR_MESSAGES["INVALID_CREDENTIALS"]
            }), 400
            
        user = User.query.filter_by(email_nik=auth.get('email_nik')).first()
        
        if not user:
            return jsonify({
                "status": "error", 
                "message": ERROR_MESSAGES["USER_NOT_FOUND"]
            }), 404
            
        if check_password_hash(user.password, auth.get('password')):
            # Generate JWT token
            token = jwt.encode({
                'id_user': user.id_user,
                'email_nik': user.email_nik,
                'role': user.role.value,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, SECRET_KEY, algorithm="HS256")
            
            return jsonify({
                "status": "success",
                "message": f"Selamat Datang {user.nama}!",
                "token": token,
                "user": {
                    "id_user": user.id_user, # <--- BARIS INI DITAMBAHKAN
                    "nama": user.nama,
                    "email_nik": user.email_nik,
                    "role": user.role.value
                }
            }), 200
        
        return jsonify({
            "status": "error",
            "message": ERROR_MESSAGES["INVALID_CREDENTIALS"]
        }), 401
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@user_bp.route("/get_dev_token", methods=["GET"])
def get_dev_token():
    """Get development token (development mode only)"""
    if not DEV_MODE:
        return jsonify({
            "status": "error",
            "message": "This endpoint is only available in development mode"
        }), 403
    
    return jsonify({
        "status": "success",
        "message": "Development token retrieved",
        "dev_token": DEV_TOKEN,
        "usage": "Use this token with Bearer in Authorization header for development purposes only"
    }), 200


# ============================================================================
# USER MANAGEMENT ROUTES
# ============================================================================

@user_bp.route("/get_users", methods=["GET"])
@token_required
def get_users(current_user):
    """Get all users"""
    try:
        users = User.query.all()
        return jsonify({
            "status": "success",
            "data": [format_user_data(user) for user in users]
        }), 200

    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@user_bp.route("/get_user/<int:id_user>", methods=["GET"])
@token_required
def get_user(current_user, id_user):
    """Get user by ID"""
    try:
        user = User.query.get_or_404(id_user)
        return jsonify({
            "status": "success",
            "data": format_user_data(user)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user {id_user}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@user_bp.route("/create_user", methods=["POST"])
@token_required
def create_user(current_user):
    """Create new user (admin only)"""
    if current_user.role != RoleEnum.admin:
        return jsonify({
            "status": "error",
            "message": ERROR_MESSAGES["ADMIN_ONLY"]
        }), 403
        
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['nama', 'email_nik', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    "status": "error",
                    "message": ERROR_MESSAGES["MISSING_FIELD"].format(field=field)
                }), 400

        # Validate email/NIK
        is_valid, error_msg = validate_email_nik(data['email_nik'])
        if not is_valid:
            return jsonify({
                "status": "error",
                "message": error_msg
            }), 400
        
        # Check for duplicate email/NIK
        existing_user = User.query.filter_by(email_nik=data['email_nik']).first()
        if existing_user:
            return jsonify({
                "status": "error",
                "message": ERROR_MESSAGES["EMAIL_NIK_EXISTS"]
            }), 409
        
        # Validate password
        is_valid, error_msg = validate_password(data['password'])
        if not is_valid:
            return jsonify({
                "status": "error",
                "message": error_msg
            }), 400

        # Hash password
        data['password'] = generate_password_hash(data['password'], method='pbkdf2:sha256')

        # Validate and set role
        if 'role' in data:
            is_valid, role_or_error = validate_role(data['role'])
            if not is_valid:
                return jsonify({
                    "status": "error",
                    "message": role_or_error
                }), 400
            data['role'] = role_or_error
        else:
            data['role'] = RoleEnum.ISE

        # Remove id_user if present
        data.pop('id_user', None)
        
        # Create user
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "User berhasil dibuat",
            "user_id": user.id_user
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@user_bp.route("/edit_user/<int:id_user>", methods=["PATCH"])
@token_required
def edit_user(current_user, id_user):
    """Edit user by ID"""
    try:
        user = User.query.get_or_404(id_user)
        data = request.json

        # Prevent ID changes
        if 'id_user' in data:
            return jsonify({
                "status": "error",
                "message": ERROR_MESSAGES["ID_CANNOT_CHANGE"]
            }), 400

        # Define allowed fields based on role
        if current_user.role != RoleEnum.admin:
            if current_user.id_user != id_user:
                return jsonify({
                    "status": "error",
                    "message": ERROR_MESSAGES["PERMISSION_DENIED"]
                }), 403
            allowed_fields = ['password']
        else:
            allowed_fields = ['nama', 'email_nik', 'password', 'role']

        # Check field permissions
        invalid_fields = [field for field in data if field not in allowed_fields]
        if invalid_fields:
            return jsonify({
                "status": "error",
                "message": "Invalid fields for this user role",
                "invalid_fields": invalid_fields,
                "allowed_fields": allowed_fields
            }), 400

        changes = {}
        
        for key, value in data.items():
            if not hasattr(user, key):
                continue
                
            old_value = getattr(user, key)

            if key == 'password':
                # Validate password
                is_valid, error_msg = validate_password(value)
                if not is_valid:
                    return jsonify({
                        "status": "error",
                        "message": error_msg
                    }), 400
                
                value = generate_password_hash(value, method='pbkdf2:sha256')
                new_value_display = "[HASHED]"
                
            elif key == 'email_nik':
                # Validate email/NIK
                is_valid, error_msg = validate_email_nik(value)
                if not is_valid:
                    return jsonify({
                        "status": "error",
                        "message": error_msg
                    }), 400
                new_value_display = value
                
            elif key == 'role':
                # Validate role
                is_valid, role_or_error = validate_role(value)
                if not is_valid:
                    return jsonify({
                        "status": "error",
                        "message": role_or_error
                    }), 400
                value = role_or_error
                new_value_display = value.value
            else:
                new_value_display = value

            # Update attribute and track changes
            setattr(user, key, value)
            changes[key] = {
                "old": old_value.value if key == 'role' else str(old_value),
                "new": new_value_display
            }

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "User successfully updated",
            "user_id": id_user,
            "changes": changes
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error editing user {id_user}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@user_bp.route("/delete_user/<int:id_user>", methods=["DELETE"])
@token_required
def delete_user(current_user, id_user):
    """Delete user by ID (admin only)"""
    if current_user.role != RoleEnum.admin:
        return jsonify({
            "status": "error",
            "message": ERROR_MESSAGES["ADMIN_ONLY"]
        }), 403
        
    try:
        user = User.query.get_or_404(id_user)
        db.session.delete(user)
        db.session.commit()
        
        # Reset ID sequence if table is empty
        remaining_users = User.query.count()
        if remaining_users == 0:
            try:
                # Try MySQL/MariaDB reset
                reset_query = text("ALTER TABLE users AUTO_INCREMENT = 1")
                db.session.execute(reset_query)
                db.session.commit()
            except Exception:
                try:
                    # Try PostgreSQL reset
                    reset_query = text("ALTER SEQUENCE users_id_user_seq RESTART WITH 1")
                    db.session.execute(reset_query)
                    db.session.commit()
                except Exception as e:
                    logger.warning(f"Could not reset sequence: {str(e)}")
            
            return jsonify({
                "status": "success",
                "message": "User deleted and ID sequence reset"
            }), 200
        
        return jsonify({
            "status": "success",
            "message": "User successfully deleted"
        }), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting user {id_user}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500