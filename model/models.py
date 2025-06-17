from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum as PgEnum
import enum

db = SQLAlchemy()

class RoleEnum(enum.Enum):
    admin = 'admin'
    ISE = 'ISE'
    off3so = 'off3so'

class User(db.Model):
    __tablename__ = 'users'
    id_user = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(100), nullable=False)
    email_nik = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(PgEnum(RoleEnum), default=RoleEnum.ISE)

class Kuitansi(db.Model):
    __tablename__ = 'kuitansi'

    id_kuitansi = db.Column(db.Integer, primary_key=True)
    nomor_kuitansi = db.Column(db.String(50), unique=True, nullable=False)
    nama = db.Column(db.String(100), nullable=False)
    tanggal = db.Column(db.Date, nullable=False)
    jumlah = db.Column(db.Float, nullable=False)
    terbilang = db.Column(db.Text, nullable=False)
    deskripsi = db.Column(db.Text, nullable=False)
    id_user = db.Column(db.Integer, db.ForeignKey('users.id_user'))

    user = db.relationship("User", backref="kuitansi")

