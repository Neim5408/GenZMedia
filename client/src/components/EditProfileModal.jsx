import React, { useState, useRef } from "react";
import { X, Camera } from "lucide-react";
import Swal from "sweetalert2";
import { userApi } from "../utils/api";

const EditProfileModal = ({ user, onClose, refreshData }) => {
    // State untuk data teks
    const [fullName, setFullName] = useState(user.full_name || "");
    const [bio, setBio] = useState(user.bio || "");
    const [loading, setLoading] = useState(false);

    // State untuk File Gambar asli (untuk dikirim ke backend)
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    // State untuk URL Pratinjau (untuk ditampilkan di UI sebelum upload)
    const [avatarPreview, setAvatarPreview] = useState(user.avatar_url);
    const [coverPreview, setCoverPreview] = useState(user.cover_photo_url);

    // Ref untuk memicu input file yang tersembunyi
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    // --- Logika Menangani Pilih File Gambar (Avatar atau Cover) ---
    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi ukuran (contoh: max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire("Oops", "Ukuran file terlalu besar (max 2MB)", "error");
            return;
        }

        // Tampilkan pratinjau instan di browser
        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === "avatar") {
                setAvatarPreview(reader.result); // Menggunakan base64 untuk pratinjau
                setAvatarFile(file); // Simpan file asli
            } else if (type === "cover") {
                setCoverPreview(reader.result);
                setCoverFile(file);
            }
        };
        reader.readAsDataURL(file);
    };

    // --- Logika Submit (Mengirim ke Backend) ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // PENTING: Untuk unggah file, kita wajib menggunakan FormData, BUKAN JSON biasa!
            const formData = new FormData();
            formData.append("full_name", fullName);
            formData.append("bio", bio);
            
            // Masukkan file jika user memilih file baru
            if (avatarFile) formData.append("avatar", avatarFile);
            if (coverFile) formData.append("cover", coverFile);

            // Tembak backend (PUT /user/update/:id)
            const response = await userApi.updateUserProfile(user.id, formData);
            
            // Update data user di LocalStorage agar Sidebar & Profil juga update otomatis
            localStorage.setItem('user', JSON.stringify(response.data.updatedUser));

            Swal.fire({
                title: 'Profil Diperbarui!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                refreshData(); // Panggil fungsi dari Profile.jsx untuk refresh halaman tanpa reload
                onClose();     // Tutup Modal
            });

        } catch (error) {
            console.error("Gagal update profil:", error);
            Swal.fire("Gagal", error.response?.data?.error || "Gagal memperbarui profil", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <form onSubmit={handleUpdate} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-fade-in-up">
                
                {/* Header & Tombol Tutup */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profil Kamu</h2>
                    <X onClick={onClose} className="w-6 h-6 text-gray-400 hover:text-gray-700 cursor-pointer transition" />
                </div>

                <div className="p-6 pt-2 space-y-5">
                    {/* --- Area Foto Latar Belakang (Cover) --- */}
                    <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-200">
                        <img src={coverPreview} alt="Cover" className="h-32 w-full object-cover" />
                        <div 
                            onClick={() => coverInputRef.current.click()}
                            className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-xs font-medium">Ubah Foto Latar</span>
                        </div>
                        <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => handleImageChange(e, "cover")} className="hidden" />
                    </div>

                    {/* --- Area Foto Profil (Avatar) --- */}
                    <div className="relative -mt-16 flex justify-center">
                        <div className="relative group rounded-full border-4 border-white shadow-xl overflow-hidden">
                            <img src={avatarPreview} alt="Avatar" className="w-24 h-24 object-cover" />
                            <div 
                                onClick={() => avatarInputRef.current.click()}
                                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">Ubah Foto</span>
                            </div>
                        </div>
                        <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleImageChange(e, "avatar")} className="hidden" />
                    </div>

                    {/* --- Input Teks --- */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Misal: Fadli Alamsyah" className="w-full mt-1.5 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tulis bio singkat kamu..." rows="3" className="w-full mt-1.5 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                    </div>

                    {/* --- Tombol Update --- */}
                    <button type="submit" disabled={loading} className={`w-full text-white py-3 rounded-xl transition ${loading ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        {loading ? "Menyimpan..." : "Simpan Perubahan →"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfileModal;