const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Install dulu: npm install axios

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

const register = async (email, password, fullName, username, birthday) => {
  // 1. Cek apakah user sudah ada
  const existingUser = await authModel.findUserByEmail(email);
  if (existingUser) throw new Error("Email sudah terdaftar");

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Simpan ke auth_db
  const newUser = await authModel.createUserAuth(email, passwordHash);

  // 4. OTOMATIS PANGGIL USER SERVICE (Internal Call)
  // Menghubungkan Auth ID ke profil User Service
  try {
    // Kirim data lengkap ke User Service
    await axios.post('http://localhost:50052/user', {
      id: newUser.id,
      email: email,
      username: username, // Menggunakan username dari input frontend
      full_name: fullName,
      birthday: birthday,
      bio: "Halo, saya pengguna baru InSight!"
    });
  } catch (err) {
    console.error("Gagal membuat profil lengkap:", err.message);
  }
  return newUser;
};

const login = async (email, password) => {
  const user = await authModel.findUserByEmail(email);
  if (!user) throw new Error("Email tidak ditemukan");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Password salah");

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
  
  // Simpan session ke DB
  const expires = new Date();
  expires.setDate(expires.getDate() + 1);
  await authModel.createSession(user.id, token, expires);

  return { token, user: { id: user.id, email: user.email } };
};

const logout = async (token) => {
  // Hapus session berdasarkan token
  const result = await authModel.deleteSession(token);
  if (result.rowCount === 0) throw new Error("Session tidak ditemukan");
};

const deleteAccount = async (id) => {
  // 1. Hapus di Auth DB
  await authModel.deleteUserAuth(id);

  // 2. Telepon User Service untuk hapus Profil
  try {
    await axios.delete(`http://localhost:50052/user/${id}`);
  } catch (err) {
    console.error("User Service gagal menghapus profil:", err.message);
  }
};

module.exports = { register, login, logout, deleteAccount };