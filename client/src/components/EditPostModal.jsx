import React, { useState } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import { postApi } from "../utils/api";

const EditPostModal = ({ post, onClose, onPostUpdated }) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [content, setContent] = useState(post?.content_text || post?.content || "");
    const [loading, setLoading] = useState(false);

    const hasMedia = !!post?.media_url || (post?.image_urls && post.image_urls.length > 0);
    const mediaUrl = post?.media_url || post?.image_urls?.[0];

    const getMediaType = (url) => {
        if (!url) return null;
        const ext = url.split("?")[0].split(".").pop().toLowerCase();
        return ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext) ? "video" : "image";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && !hasMedia) {
            Swal.fire("Oops", "Postingan tidak boleh kosong", "warning");
            return;
        }

        setLoading(true);

        try {
            await postApi.put(`/post/${post.id}`, {
                user_id: currentUser.id,
                content: content.trim(),
            });

            Swal.fire({
                title: "Berhasil!",
                text: "Postingan berhasil diperbarui.",
                icon: "success",
                timer: 1400,
                showConfirmButton: false,
            });

            onClose();
            onPostUpdated?.();
        } catch (error) {
            console.error("Gagal mengedit postingan:", error);
            Swal.fire(
                "Gagal",
                error.response?.data?.error || "Gagal mengedit postingan",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h3 className="text-lg font-bold text-gray-900">Edit Postingan</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Apa yang sedang kamu pikirkan?"
                        className="h-36 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    {mediaUrl && (
                        <div className="mt-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Media saat ini
                            </p>
                            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                                {getMediaType(mediaUrl) === "video" ? (
                                    <video
                                        src={mediaUrl}
                                        controls
                                        className="max-h-56 w-full bg-black object-contain"
                                    />
                                ) : (
                                    <img
                                        src={mediaUrl}
                                        alt="Media postingan"
                                        className="max-h-56 w-full object-cover"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-5 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPostModal;
