const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, username, birthday } = req.body;
    
    if (!email || !password) return res.status(400).json({ error: "Email dan password wajib diisi" });
    const user = await authService.register(email, password, full_name, username, birthday);
    res.status(201).json({ message: "Registrasi berhasil", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json(data);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Token tidak ditemukan" });

    await authService.logout(token);
    res.status(200).json({ message: "Logout berhasil" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await authService.deleteAccount(id);
    res.status(200).json({ message: "Akun dan profil berhasil dihapus permanen" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};