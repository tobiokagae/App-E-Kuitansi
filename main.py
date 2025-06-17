# main.py
from flask import Flask
from flask_cors import CORS # Pastikan Flask-CORS diinstal: pip install Flask-CORS
import os
from model.models import db
from route.users import user_bp
from route.kuitansi import kuitansi_bp

# Impor variabel konfigurasi langsung atau gunakan modul config
import config # <--- IMPORT MODUL CONFIG SECARA UTUH

app = Flask(__name__)

# Memuat konfigurasi dari modul config.py
app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = config.SQLALCHEMY_TRACK_MODIFICATIONS

# Ambil JWT_SECRET_KEY dari environment variable
# Ini penting karena `kuitansi.py` dan `users.py` membaca SECRET_KEY dari os.environ
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev_secret_key_not_for_production")
app.config["DEV_TOKEN"] = os.environ.get("DEV_TOKEN", "dev_access_token_for_testing")
app.config["DEV_MODE"] = os.environ.get("DEV_MODE", "True").lower() == "true"


CORS(app) # <--- AKTIFKAN CORS DI SINI

db.init_app(app)

with app.app_context():
    db.create_all()

# Register route blueprints
app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(kuitansi_bp, url_prefix="/kuitansi")

if __name__ == '__main__':
    # Untuk menjalankan di host yang dapat diakses dari luar (misal dari Docker/VM)
    # app.run(debug=True, host='0.0.0.0', port=5000)
    app.run(debug=True)