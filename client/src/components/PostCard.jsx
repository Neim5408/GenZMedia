import React, { useState, useEffect } from "react";
import { BadgeCheck, Heart, Share2, MessageCircle, Pencil, X, Trash2 } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import EditPostModal from "./EditPostModal";
import { postApi, reactionApi, commentApi, notificationApi } from "../utils/api";
import Swal from "sweetalert2";
import { useSocket } from "../utils/SocketContext";

// Tambahkan authorProfile di sini
const PostCard = ({ post, authorProfile, onPostUpdated }) => { 
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    
    // 1. Ambil data user yang sedang login dari brankas browser (Cukup 1 kali saja)
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    
    // 2. Cek apakah postingan ini buatan user yang sedang login (Cukup 1 kali saja)
    const isOwnPost = post?.user_id === loggedInUser?.id;

    const postId = post?.id || post?._id;

    // 3. Amankan data User pembuat postingan
    const author = {
        _id: post?.user_id || 'unknown',
        full_name: authorProfile?.full_name || post?.user?.full_name || post?.full_name || (isOwnPost ? loggedInUser.full_name : 'InSight User'),
        username: authorProfile?.username || post?.user?.username || post?.username || (isOwnPost ? loggedInUser.username : 'user'),
        profile_picture: authorProfile?.avatar_url || post?.user?.avatar_url || post?.avatar_url || (isOwnPost ? loggedInUser.avatar_url : 'https://cdn-icons-png.flaticon.com/512/149/149071.png')
    };

    // 4. Amankan konten tulisan (dukung format dummy maupun database)
    const content = post?.content_text || post?.content || '';
    const postWithHashtags = content ? content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>') : '';
    
    // 5. Amankan likes array agar tidak crash saat .includes() dipanggil
    const [likes, setLikes] = useState(post?.likes_count || []);

    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likesData, setLikesData] = useState([]);
    const [likesLoading, setLikesLoading] = useState(false);

    // Lightbox states
    const [previewMediaUrl, setPreviewMediaUrl] = useState(null);
    const [previewMediaType, setPreviewMediaType] = useState(null);

    // Comments States
    const [showComments, setShowComments] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [commentsList, setCommentsList] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [collapsedReplies, setCollapsedReplies] = useState({});
    const [showHiddenComments, setShowHiddenComments] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsCount, setCommentsCount] = useState(0);

    const { notifSocket } = useSocket();

    useEffect(() => {
        setLikes(post?.likes_count || []);
    }, [post?.likes_count]);

    useEffect(() => {
        if (!notifSocket || !postId) return;

        const handleNewLike = (data) => {
            if (data.post_id === postId) {
                setLikes(data.likes || []);
            }
        };

        const handleNewComment = (data) => {
            if (data.post_id === postId) {
                setCommentsCount(prev => prev + 1);
                if (showComments || showDetailModal) {
                    setCommentsList(prevList => {
                        const exists = prevList.some(c => c.id === data.comment.id);
                        if (exists) return prevList;
                        return [...prevList, data.comment];
                    });
                    // Tandai notifikasi baru dari socket ini sebagai dibaca karena kita sedang membukanya
                    if (loggedInUser?.id) {
                        notificationApi.put('/notification/read-post-comments', {
                            user_id: loggedInUser.id,
                            post_id: postId
                        }).then(() => {
                            window.dispatchEvent(new Event('unread-count-change'));
                        }).catch(err => console.warn(err));
                    }
                }
            }
        };

        const handleNewNotification = (notification) => {
            if (
                (showComments || showDetailModal) &&
                notification &&
                notification.post_id === postId &&
                notification.type === 'COMMENT' &&
                notification.user_id === loggedInUser?.id
            ) {
                notificationApi.put('/notification/read-post-comments', {
                    user_id: loggedInUser.id,
                    post_id: postId
                }).then(() => {
                    window.dispatchEvent(new Event('unread-count-change'));
                }).catch(err => console.warn(err));
            }
        };

        const handleDeleteComment = (data) => {
            if (data.post_id === postId) {
                setCommentsCount(prev => Math.max(0, prev - 1));
                setCommentsList(prevList => prevList.filter(c => c.id !== data.commentId));
            }
        };

        const handleHideComment = (data) => {
            if (data.post_id === postId) {
                setCommentsList(prevList => {
                    return prevList.map(c => c.id === data.commentId ? { ...c, is_hidden: data.is_hidden } : c);
                });
            }
        };

        notifSocket.on("newLike", handleNewLike);
        notifSocket.on("newComment", handleNewComment);
        notifSocket.on("newNotification", handleNewNotification);
        notifSocket.on("deleteComment", handleDeleteComment);
        notifSocket.on("hideComment", handleHideComment);

        return () => {
            notifSocket.off("newLike", handleNewLike);
            notifSocket.off("newComment", handleNewComment);
            notifSocket.off("newNotification", handleNewNotification);
            notifSocket.off("deleteComment", handleDeleteComment);
            notifSocket.off("hideComment", handleHideComment);
        };
    }, [notifSocket, postId, showComments, showDetailModal, loggedInUser?.id]);

    // Fetch initial comments count
    useEffect(() => {
        const fetchCount = async () => {
            if (!postId) return;
            try {
                const res = await commentApi.get(`/comment/post/${postId}`);
                setCommentsCount(res.data?.length || 0);
            } catch (err) {
                console.warn("Gagal mengambil jumlah komentar:", err);
            }
        };
        fetchCount();
    }, [postId]);

    // Fetch comments list when opened
    const fetchComments = async () => {
        if (!postId) return;
        setCommentsLoading(true);
        try {
            const res = await commentApi.get(`/comment/post/${postId}`);
            setCommentsList(res.data || []);
            setCommentsCount(res.data?.length || 0);
        } catch (error) {
            console.error("Gagal memuat komentar:", error);
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        if (showComments || showDetailModal) {
            fetchComments();
            // Tandai seluruh notifikasi komentar postingan ini sebagai dibaca
            if (loggedInUser?.id && postId) {
                notificationApi.put('/notification/read-post-comments', {
                    user_id: loggedInUser.id,
                    post_id: postId
                }).then(() => {
                    window.dispatchEvent(new Event('unread-count-change'));
                }).catch(err => console.warn(err));
            }
        }
    }, [showComments, showDetailModal, postId, loggedInUser?.id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            await commentApi.post('/comment', {
                post_id: postId,
                user_id: loggedInUser.id,
                content: commentText,
                parent_id: replyingTo ? replyingTo.id : null
            });
            setCommentText("");
            setReplyingTo(null);
            setCommentsCount(prev => prev + 1);
            fetchComments();
        } catch (error) {
            console.error("Gagal menambahkan komentar:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        Swal.fire({
            title: "Hapus Komentar?",
            text: "Tindakan ini tidak dapat dibatalkan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await commentApi.delete(`/comment/${commentId}`, {
                        data: { user_id: loggedInUser.id }
                    });
                    Swal.fire({
                        title: "Dihapus!",
                        text: "Komentar berhasil dihapus.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });
                    setCommentsCount(prev => prev - 1);
                    fetchComments();
                } catch (error) {
                    console.error("Gagal menghapus komentar:", error);
                    Swal.fire("Gagal", "Tidak dapat menghapus komentar.", "error");
                }
            }
        });
    };

    const handleToggleHideComment = async (commentId) => {
        try {
            await commentApi.put(`/comment/${commentId}/toggle-hide`, {
                user_id: loggedInUser.id
            });
            fetchComments();
        } catch (error) {
            console.error("Gagal mengubah status sembunyikan komentar:", error);
        }
    };

    const buildCommentTree = (flatComments) => {
        const commentMap = {};
        const roots = [];

        flatComments.forEach(comment => {
            comment.replies = [];
            commentMap[comment.id] = comment;
        });

        flatComments.forEach(comment => {
            if (comment.parent_id && commentMap[comment.parent_id]) {
                comment.parent_username = commentMap[comment.parent_id].username;
                commentMap[comment.parent_id].replies.push(comment);
            } else {
                roots.push(comment);
            }
        });

        return roots;
    };

    const flattenReplies = (replies) => {
        const flat = [];
        const traverse = (list) => {
            list.forEach(reply => {
                flat.push(reply);
                if (reply.replies && reply.replies.length > 0) {
                    traverse(reply.replies);
                }
            });
        };
        traverse(replies);
        // Urutkan berdasarkan waktu agar urut kronologis
        flat.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return flat;
    };

    const renderComments = (tree, isModal = false, isHiddenSection = false, depth = 0) => {
        return tree.map((comment) => {
            const isCommentAuthor = comment.user_id === loggedInUser?.id;
            const isCollapsed = collapsedReplies[comment.id];
            
            // Jika di kedalaman 1 (depth === 1), ratakan semua reply di bawahnya (depth >= 2) ke tingkat 2 saja
            const allReplies = (depth === 1 && comment.replies && comment.replies.length > 0)
                ? flattenReplies(comment.replies)
                : comment.replies || [];

            return (
                <div 
                    key={comment.id} 
                    className={`${depth === 0 ? 'pl-3 border-l-2 border-gray-100 mt-2' : depth >= 3 ? 'pl-0 border-l border-gray-200 mt-1.5' : 'pl-3 border-l border-gray-200 mt-1.5'} space-y-1.5 ${isHiddenSection ? 'opacity-70 bg-gray-50/50 p-2 rounded-lg border-indigo-200' : ''}`}
                >
                    <div className="flex items-start gap-2">
                        <img 
                            src={comment.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                            alt="avatar" 
                            className="w-6 h-6 rounded-full object-cover border border-gray-100 mt-0.5"
                        />
                        <div className="flex-1 min-w-0 bg-gray-55/80 rounded-xl px-3 py-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">
                                    {comment.full_name || comment.username || "InSight User"}
                                </span>
                                <span className="text-[9px] text-gray-400">
                                    {moment(comment.created_at).fromNow()}
                                </span>
                            </div>
                            <p className="text-gray-700 mt-0.5 break-words">
                                {comment.parent_username && (
                                    <span className="text-indigo-600 font-semibold mr-1">
                                        @{comment.parent_username}
                                    </span>
                                )}
                                {comment.content}
                            </p>
                            {isHiddenSection && (
                                <span className="inline-block mt-1 text-[8px] bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded font-bold">
                                    (Sembunyikan)
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pl-8 flex items-center gap-3 text-[10px] font-bold text-gray-500">
                        {!isHiddenSection && (
                            <button 
                                onClick={() => setReplyingTo(comment)}
                                className="hover:text-indigo-600 cursor-pointer"
                            >
                                Balas
                            </button>
                        )}

                        {isCommentAuthor && (
                            <button 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                                Hapus
                            </button>
                        )}

                        {isOwnPost && !isCommentAuthor && (
                            <button 
                                onClick={() => handleToggleHideComment(comment.id)}
                                className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                                {comment.is_hidden ? "Tampilkan" : "Sembunyikan"}
                            </button>
                        )}

                        {depth === 0 && comment.replies && comment.replies.length > 0 && (
                            <button 
                                onClick={() => setCollapsedReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                className="text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                            >
                                {isCollapsed ? `Tampilkan Balasan (${flattenReplies(comment.replies).length})` : "Sembunyikan Balasan"}
                            </button>
                        )}

                        {depth === 1 && comment.replies && comment.replies.length > 0 && (
                            <button 
                                onClick={() => setCollapsedReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                className="text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                            >
                                {isCollapsed ? `Tampilkan Balasan (${allReplies.length})` : "Sembunyikan Balasan"}
                            </button>
                        )}
                    </div>

                    {/* Tampilkan balasan dengan kedalaman terkontrol */}
                    {depth < 2 && allReplies.length > 0 && !isCollapsed && (
                        <div className={`${depth >= 2 ? 'pl-0' : 'pl-3'} space-y-1.5 mt-1.5`}>
                            {renderComments(allReplies, isModal, isHiddenSection, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const handleLike = async () => {
        if (!loggedInUser || !postId) return;
        
        const hasLiked = likes.includes(loggedInUser.id);
        const updatedLikes = hasLiked
            ? likes.filter(id => id !== loggedInUser.id)
            : [...likes, loggedInUser.id];
        setLikes(updatedLikes);

        try {
            await reactionApi.post('/reaction', {
                user_id: loggedInUser.id,
                post_id: postId,
                reaction_type: 'LIKE'
            });
            if (onPostUpdated) {
                onPostUpdated();
            }
        } catch (error) {
            console.warn("Gagal mengirim reaksi ke server:", error);
        }
    };

    const handleDeletePost = async () => {
        const confirm = await Swal.fire({
            title: "Hapus Postingan?",
            text: "Postingan Anda akan dihapus secara permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
        });

        if (!confirm.isConfirmed) return;

        try {
            await postApi.delete(`/post/${postId}`, {
                data: { user_id: loggedInUser.id }
            });
            Swal.fire({
                title: "Berhasil!",
                text: "Postingan berhasil dihapus.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            if (onPostUpdated) {
                onPostUpdated();
            }
        } catch (error) {
            console.error("Gagal menghapus postingan:", error);
            Swal.fire("Gagal", "Tidak dapat menghapus postingan.", "error");
        }
    };

    const handleOpenLikesModal = async () => {
        setShowLikesModal(true);
        setLikesLoading(true);
        setLikesData([]);

        try {
            const response = await reactionApi.get(`/reaction/post/${postId}`);
            setLikesData(response.data || []);
        } catch (error) {
            console.error("Gagal mengambil data penyuara reaksi:", error);
            // Fallback for dummy/mock data
            const mockLikes = likes.map(userId => {
                if (userId === loggedInUser?.id) {
                    return {
                        id: loggedInUser.id,
                        user_id: loggedInUser.id,
                        username: loggedInUser.username,
                        full_name: loggedInUser.full_name,
                        avatar_url: loggedInUser.avatar_url
                    };
                }
                return {
                    id: userId,
                    user_id: userId,
                    username: "user_" + userId.substring(0, 6),
                    full_name: "InSight User",
                    avatar_url: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                };
            });
            setLikesData(mockLikes);
        } finally {
            setLikesLoading(false);
        }
    };

    const getMediaType = (mediaUrl) => {
        if (!mediaUrl) return null;
        const ext = mediaUrl.split('?')[0].split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext) ? 'video' : 'image';
    };

    const mediaItems = post?.image_urls
        ? post.image_urls.map((url) => ({ url, type: getMediaType(url) }))
        : post?.media_url
            ? [{ url: post.media_url, type: post?.media_type || getMediaType(post.media_url) }]
            : [];

    // 7. Amankan format tanggal
    const postDate = post?.created_at || post?.createdAt || new Date();

    return ( 
        <div id={`post-${postId}`} className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl hover:shadow-md transition duration-200">
            {/* User Info */}
            <div className="flex items-start justify-between gap-3">
                <div onClick={() => navigate('/profile/' + author._id)} className="inline-flex items-center gap-3 cursor-pointer">
                    <img src={author.profile_picture} alt="profile" className="w-10 h-10 rounded-full shadow-sm object-cover border border-gray-100"/>
                    <div>
                        <div className="flex items-center space-x-1">
                            <span className="font-semibold text-gray-900 hover:underline">
                                {author.full_name}
                            </span>
                            <BadgeCheck className="w-4 h-4 text-blue-500"/>
                        </div>
                        <div className="text-gray-500 text-sm">
                            @{author.username} • {moment(postDate).fromNow()}
                        </div>
                    </div>
                </div>

                {isOwnPost && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleDeletePost}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                        </button>
                    </div>
                )}
            </div>
            
            {/* Clickable body area to open detail modal */}
            <div 
                onClick={() => setShowDetailModal(true)} 
                className="space-y-3 cursor-pointer group/body"
            >
                {/* Content */}
                {content && (
                    <div 
                        className="text-gray-800 text-[15px] whitespace-pre-line leading-relaxed group-hover/body:text-slate-900 transition" 
                        dangerouslySetInnerHTML={{__html: postWithHashtags}}
                    />
                )}

                {/* Media */}
                {mediaItems.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {mediaItems.map((item, index) => (
                            item.type === 'video' ? (
                                <div key={index} className="relative overflow-hidden rounded-xl border border-gray-100">
                                    <video
                                        src={item.url}
                                        className={`w-full ${mediaItems.length === 1 ? 'col-span-2 h-auto max-h-[500px]' : 'h-56'} object-cover`}
                                    />
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover/body:opacity-100 transition rounded-xl pointer-events-none">
                                        <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Klik untuk melihat detail & komentar</span>
                                    </div>
                                </div>
                            ) : (
                                <div key={index} className="relative overflow-hidden rounded-xl border border-gray-100">
                                    <img 
                                        src={item.url} 
                                        className={`w-full h-56 object-cover ${mediaItems.length === 1 ? 'col-span-2 h-auto max-h-[500px]' : ''}`} 
                                        alt="post media" 
                                    />
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover/body:opacity-100 transition rounded-xl pointer-events-none">
                                        <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Klik untuk melihat detail & komentar</span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 text-gray-500 text-sm pt-4 border-t border-gray-100 mt-4">
                <div className="flex items-center gap-1 hover:text-red-500 transition-colors group">
                    <div className="p-1.5 rounded-full group-hover:bg-red-50 transition cursor-pointer" onClick={handleLike}>
                        <Heart className={`w-[18px] h-[18px] ${likes.includes(loggedInUser?.id) ? 'text-red-500 fill-red-500' : ''}`}/>
                    </div>
                    <span 
                        className="font-medium cursor-pointer hover:underline px-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLikesModal();
                        }}
                    >
                        {likes.length}
                    </span>
                </div>
                <div 
                    className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-500 transition-colors group"
                    onClick={() => setShowDetailModal(true)}
                >
                    <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition">
                        <MessageCircle className="w-[18px] h-[18px]"/>
                    </div>
                    <span className="font-medium">{commentsCount}</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-green-500 transition-colors group">
                    <div className="p-1.5 rounded-full group-hover:bg-green-50 transition">
                        <Share2 className="w-[18px] h-[18px]"/>
                    </div>
                    <span className="font-medium">7</span>
                </div>
            </div>
            {showEditModal && (
                <EditPostModal
                    post={post}
                    onClose={() => setShowEditModal(false)}
                    onPostUpdated={onPostUpdated}
                />
            )}

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-800 text-sm">Komentar ({commentsCount})</h4>
                        {replyingTo && (
                            <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-semibold">
                                Membalas @{replyingTo.username}
                            </span>
                        )}
                    </div>
                    
                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                        <img 
                            src={loggedInUser?.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                            alt="my avatar" 
                            className="w-8 h-8 rounded-full object-cover border border-gray-100"
                        />
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={replyingTo ? `Balas @${replyingTo.username || 'user'}...` : "Tulis komentar..."}
                                className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-full py-1.5 px-4 text-xs focus:outline-none transition duration-150"
                            />
                            {replyingTo && (
                                <button 
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                        <button 
                            type="submit"
                            disabled={!commentText.trim()}
                            className="px-4 py-1.5 bg-indigo-600 disabled:bg-indigo-300 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-full transition cursor-pointer"
                        >
                            Kirim
                        </button>
                    </form>

                    {/* Comments List */}
                    {commentsLoading ? (
                        <div className="py-4 flex justify-center">
                            <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                        </div>
                    ) : commentsList.length === 0 ? (
                        <p className="text-gray-500 text-[11px] text-center py-4">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
                    ) : (
                        <div className="space-y-1">
                            {/* Render regular comments */}
                            {renderComments(buildCommentTree(commentsList.filter(c => !c.is_hidden)), false, false)}
                            
                            {/* Render hidden comments toggle */}
                            {commentsList.filter(c => c.is_hidden).length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center">
                                    <button 
                                        type="button"
                                        onClick={() => setShowHiddenComments(!showHiddenComments)}
                                        className="text-[10px] font-bold text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition cursor-pointer"
                                    >
                                        {showHiddenComments ? "Sembunyikan komentar tersembunyi" : `Lihat komentar yang disembunyikan (${commentsList.filter(c => c.is_hidden).length})`}
                                    </button>
                                    
                                    {showHiddenComments && (
                                        <div className="w-full mt-2 space-y-1">
                                            {renderComments(buildCommentTree(commentsList.filter(c => c.is_hidden)), false, true)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal List Likes */}
            {showLikesModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-in fade-in duration-200" 
                    onClick={() => setShowLikesModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                                Disukai Oleh
                            </h3>
                            <button
                                onClick={() => setShowLikesModal(false)}
                                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/20">
                            {likesLoading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin"></div>
                                </div>
                            ) : likesData.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-10 font-medium">
                                    Belum ada yang menyukai postingan ini.
                                </p>
                            ) : (
                                likesData.map((item) => {
                                    const id = item.user_id || item.id;
                                    const avatar = item.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                    return (
                                        <div 
                                            key={id}
                                            onClick={() => {
                                                setShowLikesModal(false);
                                                navigate(`/profile/${id}`);
                                            }}
                                            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition cursor-pointer"
                                        >
                                            <img 
                                                src={avatar} 
                                                alt={item.username} 
                                                className="w-11 h-11 rounded-full object-cover border border-slate-200"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">
                                                    {item.full_name || item.username || "Tanpa Nama"}
                                                </p>
                                                <p className="text-xs text-slate-400 font-semibold">
                                                    @{item.username || "username"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setShowLikesModal(false)}
                                className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-full transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Modal Overlay */}
            {previewMediaUrl && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
                    onClick={() => { setPreviewMediaUrl(null); setPreviewMediaType(null); }}
                >
                    {/* Close Button */}
                    <button className="absolute top-5 right-5 text-white/70 hover:text-white transition text-lg font-semibold bg-transparent border-none cursor-pointer">
                        Tutup
                    </button>
                    
                    {previewMediaType === 'video' ? (
                        <video
                            src={previewMediaUrl} 
                            controls
                            autoPlay
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl bg-black"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    ) : (
                        <img 
                            src={previewMediaUrl} 
                            alt="Preview Besar" 
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    )}
                </div>
            )}
            {/* Post Detail Modal */}
            {showDetailModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200" 
                    onClick={() => setShowDetailModal(false)}
                >
                    <div 
                        className={`bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 ${
                            mediaItems.length === 0 ? 'max-w-2xl' : ''
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left Panel: Media (Only if post has media) */}
                        {mediaItems.length > 0 && (
                            <div className="w-full md:w-1/2 bg-slate-950 flex flex-col justify-center relative min-h-[300px] md:min-h-0">
                                <div className="absolute top-4 left-4 z-10 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Media
                                </div>
                                <div className="overflow-y-auto max-h-[40vh] md:max-h-[80vh] p-2 flex flex-col gap-2 justify-center items-center">
                                    {mediaItems.map((item, idx) => (
                                        item.type === 'video' ? (
                                            <video 
                                                key={idx}
                                                src={item.url} 
                                                controls 
                                                className="max-w-full max-h-[35vh] md:max-h-[75vh] object-contain rounded-xl shadow-lg"
                                            />
                                        ) : (
                                            <img 
                                                key={idx}
                                                src={item.url} 
                                                alt="Post media" 
                                                className="max-w-full max-h-[35vh] md:max-h-[75vh] object-contain rounded-xl shadow-lg cursor-zoom-in"
                                                onClick={() => {
                                                    setPreviewMediaUrl(item.url);
                                                    setPreviewMediaType('image');
                                                }}
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Right Panel: Content & Comments */}
                        <div className={`w-full ${mediaItems.length > 0 ? 'md:w-1/2' : 'w-full'} flex flex-col h-[75vh] md:h-[80vh] overflow-hidden`}>
                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <img src={author.profile_picture} alt="profile" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold text-gray-900 text-xs">{author.full_name}</span>
                                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            @{author.username} • {moment(postDate).fromNow()}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Scrollable Body (Post content + Comments list) */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/10">
                                {/* Post Content text */}
                                {content && (
                                    <div 
                                        className="text-gray-800 text-sm whitespace-pre-line leading-relaxed pb-4 border-b border-gray-100"
                                        dangerouslySetInnerHTML={{__html: postWithHashtags}}
                                    />
                                )}

                                {/* Likes & Comments counter */}
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 pb-3 border-b border-gray-100">
                                    <span className="hover:underline cursor-pointer" onClick={() => { handleOpenLikesModal(); }}>
                                        {likes.length} Suka
                                    </span>
                                    <span>
                                        {commentsCount} Komentar
                                    </span>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-1">
                                    {commentsLoading ? (
                                        <div className="py-8 flex justify-center">
                                            <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                                        </div>
                                    ) : commentsList.length === 0 ? (
                                        <p className="text-gray-500 text-xs text-center py-8">Belum ada komentar. Jadilah yang pertama!</p>
                                    ) : (
                                        <>
                                            {/* Render regular comments */}
                                            {renderComments(buildCommentTree(commentsList.filter(c => !c.is_hidden)), true, false)}

                                            {/* Render hidden comments */}
                                            {commentsList.filter(c => c.is_hidden).length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowHiddenComments(!showHiddenComments)}
                                                        className="text-[9px] font-bold text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 px-2.5 py-1.5 rounded-full transition cursor-pointer"
                                                    >
                                                        {showHiddenComments ? "Sembunyikan komentar tersembunyi" : `Lihat komentar tersembunyi (${commentsList.filter(c => c.is_hidden).length})`}
                                                    </button>
                                                    
                                                    {showHiddenComments && (
                                                        <div className="w-full mt-2 space-y-1">
                                                            {renderComments(buildCommentTree(commentsList.filter(c => c.is_hidden)), true, true)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Reply Indicator if active inside modal */}
                            {replyingTo && (
                                <div className="px-4 py-2 bg-indigo-50 border-t border-gray-100 flex items-center justify-between text-xs text-indigo-700 font-semibold">
                                    <span>Membalas @{replyingTo.username}</span>
                                    <button 
                                        onClick={() => setReplyingTo(null)}
                                        className="text-gray-400 hover:text-gray-650"
                                    >
                                        Batal
                                    </button>
                                </div>
                            )}

                            {/* Footer: Add Comment Form */}
                            <form onSubmit={handleAddComment} className="p-4 border-t border-slate-100 bg-white flex gap-2 items-center">
                                <img 
                                    src={loggedInUser?.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                    alt="my avatar" 
                                    className="w-7 h-7 rounded-full object-cover border border-gray-100"
                                />
                                <div className="flex-1">
                                    <input 
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder={replyingTo ? `Balas @${replyingTo.username}...` : "Tulis komentar..."}
                                        className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-full py-1.5 px-4 text-xs focus:outline-none transition duration-150"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="px-4 py-1.5 bg-indigo-600 disabled:bg-indigo-300 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-full transition cursor-pointer"
                                >
                                    Kirim
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PostCard;
