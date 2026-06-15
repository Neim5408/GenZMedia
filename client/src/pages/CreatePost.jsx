<<<<<<< HEAD
import React, { useState, useRef, useEffect } from "react"; // Tambahkan useEffect
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, X } from "lucide-react";
import Swal from "sweetalert2";
import { postApi, userApi } from "../utils/api"; // Tambahkan userApi

const CreatePost = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // State baru untuk menampung data profil lengkap
    const [authorData, setAuthorData] = useState(null); 

    const fileInputRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // --- Ambil Data Profil Terbaru saat Halaman Dibuka ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser?.id) {
                try {
                    const response = await userApi.get(`/user/${currentUser.id}`);
                    setAuthorData(response.data);
                } catch (error) {
                    console.error("Gagal mengambil data author:", error);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire("Oops", "Ukuran foto maksimal 5MB", "error");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result);
            setMediaFile(file);
            setPreviewMediaType(getPreviewMediaType(file));
        };
        reader.readAsDataURL(file);
    };

    const getPreviewMediaType = (file) => {
        if (!file) return null;
        if (file.type.startsWith('video')) return 'video';
        const ext = file.name.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext) ? 'video' : 'image';
    };

    const [previewMediaType, setPreviewMediaType] = useState(null);

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setPreviewMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !mediaFile) {
            Swal.fire("Oops", "Postingan tidak boleh kosong", "warning");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("user_id", currentUser.id);
            formData.append("content", content);
            if (mediaFile) formData.append("media", mediaFile);

            await postApi.post('/post', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Swal.fire({
                title: 'Berhasil!',
                text: 'Postingan kamu sudah mengudara!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/profile');
            });

        } catch (error) {
            console.error("Gagal membuat postingan:", error);
            Swal.fire("Gagal", error.response?.data?.error || "Gagal membuat postingan", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit animate-fade-in-up">
                
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Buat Postingan Baru</h2>
                    <X onClick={() => navigate(-1)} className="w-6 h-6 text-gray-400 hover:text-gray-700 cursor-pointer transition" />
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Profil User Mini (SEKARANG MENGGUNAKAN DATA authorData) */}
                    <div className="flex items-center gap-3 mb-4">
                        <img 
                            src={authorData?.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                            {/* Menampilkan Nama Lengkap atau tulisan 'Loading...' */}
                            <p className="font-semibold text-sm text-gray-900">
                                {authorData ? authorData.full_name : "Memuat profil..."}
                            </p>
                            {/* Menampilkan Username */}
                            {authorData && <p className="text-xs text-gray-500">@{authorData.username}</p>}
                        </div>
                    </div>

                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Apa yang sedang kamu pikirkan?"
                        className="w-full h-32 text-lg focus:outline-none resize-none placeholder-gray-400 mb-4"
                    ></textarea>

                    {mediaPreview && (
                        <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-200">
                            {previewMediaType === 'video' ? (
                                <video
                                    src={mediaPreview}
                                    controls
                                    className="w-full h-auto max-h-96 object-cover"
                                />
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="w-full h-auto max-h-96 object-cover" />
                            )}
                            <button 
                                type="button" 
                                onClick={removeMedia}
                                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                            <input 
                                type="file" 
                                accept="image/*,video/*" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition font-medium text-sm cursor-pointer"
                            >
                                <ImageIcon className="w-5 h-5" />
                                <span>Tambah Foto/Video</span>
                            </button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-8 py-2.5 rounded-full font-bold text-white transition shadow-sm ${loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {loading ? "Memposting..." : "Posting"}
                        </button>
                    </div>
                </form>
            </div>
=======
import React from "react";

const CreatePost = () => {
    return (
        <div>
            <h1>Create Post Page</h1>
>>>>>>> origin/Kibob_update_home
        </div>
    );
};

export default CreatePost;