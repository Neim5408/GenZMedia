import React, { useState, useEffect } from "react";
import { BadgeCheck, Heart, Share2, MessageCircle, Trash2 } from "lucide-react";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import { commentApi, userApi, notificationApi } from "../utils/api";

// Tambahkan authorProfile di sini
const PostCard = ({ post, authorProfile }) => { 
    const navigate = useNavigate();
    const location = useLocation();
    
    // 1. Ambil data user yang sedang login dari brankas browser (Cukup 1 kali saja)
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    
    // 2. Cek apakah postingan ini buatan user yang sedang login (Cukup 1 kali saja)
    const isOwnPost = post?.user_id === loggedInUser?.id;

    // State untuk komentar
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState(loggedInUser);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);
    const [collapsedComments, setCollapsedComments] = useState({});
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [showHidden, setShowHidden] = useState(false);

    const handleHideComment = async (commentId, shouldHide = true) => {
        if (!loggedInUser) return;
        try {
            const res = await commentApi.put(`/comment/${commentId}/hide`, {
                user_id: loggedInUser.id,
                is_hidden: shouldHide
            });
            if (res.data && res.data.data) {
                setComments(prev => prev.map(c => {
                    if (c.id === commentId) {
                        return { ...c, is_hidden: shouldHide };
                    }
                    return c;
                }));
            }
        } catch (err) {
            console.error("Gagal mengubah status sembunyi komentar", err);
        }
    };

    const toggleCollapse = (commentId) => {
        setCollapsedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const postId = post?._id || post?.id;

    // Ambil detail profil user yang sedang login jika belum lengkap di localStorage
    useEffect(() => {
        const fetchCurrentProfile = async () => {
            if (loggedInUser?.id && (!loggedInUser.full_name || !loggedInUser.avatar_url)) {
                try {
                    const res = await userApi.get(`/user/${loggedInUser.id}`);
                    if (res.data) {
                        const updated = { ...loggedInUser, ...res.data };
                        localStorage.setItem('user', JSON.stringify(updated));
                        setCurrentUserProfile(updated);
                    }
                } catch (err) {
                    console.error("Gagal mengambil profil user login", err);
                }
            }
        };
        fetchCurrentProfile();
    }, []);

    // Ambil daftar komentar untuk postingan ini
    useEffect(() => {
        const fetchComments = async () => {
            if (postId) {
                try {
                    const res = await commentApi.get(`/comment/post/${postId}`);
                    if (Array.isArray(res.data)) {
                        setComments(res.data);
                    }
                } catch (err) {
                    console.error("Gagal mengambil komentar untuk postingan", postId, err);
                }
            }
        };
        fetchComments();
    }, [postId]);

    // Buka detail modal, section komentar & scroll otomatis ketika hash URL merujuk ke post ini
    useEffect(() => {
        if (location.hash === `#post-${postId}`) {
            setIsDetailOpen(true);
            setShowComments(true);
            setTimeout(() => {
                const element = document.getElementById(`post-${postId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }, [location.hash, postId]);

    // 3. Amankan data User pembuat postingan
    const author = {
        _id: post?.user_id || 'unknown',
        full_name: authorProfile?.full_name || post?.user?.full_name || (isOwnPost ? (currentUserProfile?.full_name || loggedInUser?.full_name) : 'InSight User'),
        username: authorProfile?.username || post?.user?.username || (isOwnPost ? (currentUserProfile?.username || loggedInUser?.username) : 'user'),
        profile_picture: authorProfile?.avatar_url || post?.user?.avatar_url || (isOwnPost ? (currentUserProfile?.avatar_url || loggedInUser?.avatar_url) : 'https://cdn-icons-png.flaticon.com/512/149/149071.png')
    };

    // 4. Amankan konten tulisan (dukung format dummy maupun database)
    const content = post?.content_text || post?.content || '';
    const postWithHashtags = content ? content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>') : '';
    
    // 5. Amankan likes array agar tidak crash saat .includes() dipanggil
    const [likes, setLikes] = useState(post?.likes_count || []);

    const handleLike = async () => {
        // Logika like nanti di sini
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !loggedInUser) return;

        setSubmittingComment(true);
        try {
            const res = await commentApi.post('/comment', {
                post_id: postId,
                user_id: loggedInUser.id,
                content: newComment.trim()
            });

            if (res.data && res.data.comment) {
                const addedComment = {
                    ...res.data.comment,
                    username: currentUserProfile?.username || loggedInUser?.username || 'user',
                    full_name: currentUserProfile?.full_name || loggedInUser?.full_name || 'InSight User',
                    avatar_url: currentUserProfile?.avatar_url || loggedInUser?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                };
                setComments(prev => [...prev, addedComment]);
                setNewComment("");

                // Kirim notifikasi ke pemilik post
                if (post?.user_id && post.user_id !== loggedInUser.id) {
                    try {
                        await notificationApi.post('/notification', {
                            user_id: post.user_id,
                            type: 'COMMENT',
                            reference_id: loggedInUser.id,
                            post_id: postId
                        });
                    } catch (notificationError) {
                        console.error("Gagal mengirim notifikasi komentar:", notificationError);
                    }
                }
            }
        } catch (err) {
            console.error("Gagal menambahkan komentar", err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!loggedInUser) return;
        try {
            await commentApi.delete(`/comment/${commentId}?user_id=${loggedInUser.id}`, {
                data: { user_id: loggedInUser.id }
            });
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error("Gagal menghapus komentar", err);
        }
    };

    const handleReplySubmit = async (e, parentId) => {
        e.preventDefault();
        if (!replyContent.trim() || !loggedInUser) return;

        setSubmittingReply(true);
        try {
            const res = await commentApi.post('/comment', {
                post_id: postId,
                user_id: loggedInUser.id,
                content: replyContent.trim(),
                parent_id: parentId
            });

            if (res.data && res.data.comment) {
                const addedReply = {
                    ...res.data.comment,
                    username: currentUserProfile?.username || loggedInUser?.username || 'user',
                    full_name: currentUserProfile?.full_name || loggedInUser?.full_name || 'InSight User',
                    avatar_url: currentUserProfile?.avatar_url || loggedInUser?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                };
                setComments(prev => [...prev, addedReply]);
                setReplyContent("");
                setReplyingTo(null);

                // Kirim notifikasi ke pemilik komentar yang dibalas
                const parentComment = comments.find(c => c.id === parentId);
                if (parentComment && parentComment.user_id && parentComment.user_id !== loggedInUser.id) {
                    try {
                        await notificationApi.post('/notification', {
                            user_id: parentComment.user_id,
                            type: 'COMMENT',
                            reference_id: loggedInUser.id,
                            post_id: postId
                        });
                    } catch (notificationError) {
                        console.error("Gagal mengirim notifikasi balasan komentar ke pemilik komentar:", notificationError);
                    }
                }

                // Kirim juga ke pemilik post jika pemilik post berbeda dari pemberi komentar awal dan pembuat balasan
                if (post?.user_id && post.user_id !== loggedInUser.id && (!parentComment || post.user_id !== parentComment.user_id)) {
                    try {
                        await notificationApi.post('/notification', {
                            user_id: post.user_id,
                            type: 'COMMENT',
                            reference_id: loggedInUser.id,
                            post_id: postId
                        });
                    } catch (notificationError) {
                        console.error("Gagal mengirim notifikasi balasan komentar ke pemilik post:", notificationError);
                    }
                }
            }
        } catch (err) {
            console.error("Gagal menambahkan balasan komentar", err);
        } finally {
            setSubmittingReply(false);
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

    const buildTwoLevelCommentTree = (commentList) => {
        const roots = commentList.filter(c => !c.parent_id);
        const rootMap = {};
        
        roots.forEach(r => {
            rootMap[r.id] = { ...r, children: [] };
        });

        const level1Map = {};
        const remainingComments = [];
        
        commentList.forEach(c => {
            if (c.parent_id) {
                if (rootMap[c.parent_id]) {
                    const node = { ...c, children: [] };
                    rootMap[c.parent_id].children.push(node);
                    level1Map[c.id] = node;
                } else {
                    remainingComments.push(c);
                }
            }
        });

        const findLevel1AncestorId = (comment, allComments, l1Map, rMap) => {
            let current = comment;
            while (current && current.parent_id) {
                if (rMap[current.parent_id]) {
                    return current.id;
                }
                const parent = allComments.find(c => c.id === current.parent_id);
                if (!parent) break;
                current = parent;
            }
            return current.id;
        };

        remainingComments.forEach(c => {
            const l1AncestorId = findLevel1AncestorId(c, commentList, level1Map, rootMap);
            if (level1Map[l1AncestorId]) {
                level1Map[l1AncestorId].children.push(c);
            } else {
                let current = c;
                while (current && current.parent_id) {
                    const parent = commentList.find(x => x.id === current.parent_id);
                    if (!parent) break;
                    current = parent;
                }
                if (rootMap[current.id]) {
                    rootMap[current.id].children.push(c);
                } else {
                    rootMap[c.id] = { ...c, children: [] };
                }
            }
        });

        const tree = Object.values(rootMap);
        tree.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        tree.forEach(root => {
            root.children.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            root.children.forEach(l1 => {
                if (l1.children) {
                    l1.children.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                }
            });
        });
        
        return tree;
    };

    const visibleComments = comments.filter(c => !c.is_hidden);
    const hiddenComments = comments.filter(c => c.is_hidden);

    const commentTree = buildTwoLevelCommentTree(visibleComments);
    const hiddenCommentTree = buildTwoLevelCommentTree(hiddenComments);

    const renderComments = (tree, isModal = false, isHiddenSection = false) => {
        if (!tree || tree.length === 0) return null;

        return tree.map((comment) => {
            const parentUserAvatar = comment.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            const replies = comment.children || [];
            const isCollapsed = !!collapsedComments[comment.id];

            // Setup sizes and styles based on isModal and isHiddenSection
            const textClass = isModal ? "text-xs" : "text-sm";
            const avatarClass = isModal ? "w-7 h-7 mt-0.5" : "w-8 h-8 mt-1";
            const bubbleClass = isHiddenSection 
                ? (isModal ? "bg-amber-50/40 rounded-2xl px-3 py-2 border border-amber-100/30" : "bg-amber-50/40 rounded-2xl px-3 py-2 border border-amber-100/30 transition-colors relative")
                : (isModal ? "bg-gray-100/50 rounded-2xl px-3 py-2" : "bg-gray-50 hover:bg-gray-100 rounded-2xl px-3 py-2 transition-colors relative");
            const titleClass = isModal ? "font-semibold text-gray-900 text-[11px]" : "font-semibold text-gray-900 text-xs";
            const dateClass = isModal ? "text-[9px] text-gray-400" : "text-[10px] text-gray-400";
            const contentClass = isModal ? "text-gray-700 mt-1 leading-normal" : "text-gray-700 text-xs mt-1";
            const actionClass = isModal ? "flex gap-4 mt-1 pl-2 text-[10px] text-gray-500 font-semibold" : "flex gap-4 mt-1 pl-3 text-[11px] text-gray-500 font-semibold";

            return (
                <div key={comment.id} className={`space-y-3 ${isHiddenSection ? 'opacity-70' : ''}`}>
                    {/* Parent Comment (Level 0) */}
                    <div className={`flex gap-2 ${textClass} items-start group`}>
                        <img 
                            src={parentUserAvatar} 
                            alt="avatar" 
                            className={`${avatarClass} rounded-full object-cover border border-gray-50`}
                        />
                        <div className="flex-1">
                            <div className={bubbleClass}>
                                <div className="flex items-center justify-between">
                                    <span className={titleClass}>
                                        {comment.full_name || `@${comment.username}`}
                                        {isHiddenSection && <span className="text-[10px] text-amber-600 font-semibold ml-1.5 bg-amber-50 px-1 py-0.5 rounded border border-amber-100">(Sembunyikan)</span>}
                                    </span>
                                    <span className={dateClass}>
                                        {moment(comment.created_at).fromNow()}
                                    </span>
                                </div>
                                <p className={contentClass}>{comment.content}</p>
                            </div>
                            
                            {/* Action Links */}
                            <div className={actionClass}>
                                <button 
                                    onClick={() => {
                                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                        setReplyContent("");
                                    }} 
                                    className="hover:text-indigo-600 transition"
                                >
                                    Balas
                                </button>
                                {replies.length > 0 && (
                                    <button 
                                        onClick={() => toggleCollapse(comment.id)} 
                                        className="hover:text-indigo-600 text-slate-400 transition"
                                    >
                                        {isCollapsed 
                                            ? `Lihat balasan (${replies.length})` 
                                            : "Sembunyikan balasan"
                                        }
                                    </button>
                                )}
                                {/* Hapus / Sembunyikan Komentar */}
                                {(comment.user_id === loggedInUser?.id || loggedInUser?.role === 'admin' || loggedInUser?.id === 'admin-1' || loggedInUser?.id === 'admin-2') ? (
                                    <button 
                                        onClick={() => handleCommentDelete(comment.id)}
                                        className="hover:text-red-500 text-gray-500 transition"
                                    >
                                        Hapus
                                    </button>
                                ) : isOwnPost ? (
                                    <button 
                                        onClick={() => handleHideComment(comment.id, !comment.is_hidden)}
                                        className="hover:text-amber-600 text-gray-500 transition"
                                    >
                                        {comment.is_hidden ? "Tampilkan" : "Sembunyikan"}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Reply input under Parent Comment */}
                    {replyingTo === comment.id && (
                        <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className={`flex items-center gap-2 mt-2 ${isModal ? 'ml-8' : 'ml-10'} animate-fade-in`}>
                            <img 
                                src={currentUserProfile?.avatar_url || loggedInUser?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                                alt="user avatar" 
                                className="w-6 h-6 rounded-full object-cover border border-gray-100"
                            />
                            <input 
                                type="text" 
                                placeholder={`Balas @${comment.username || 'user'}...`} 
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className={`flex-1 bg-gray-100 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-xs`}
                                autoFocus
                            />
                            <button 
                                type="submit" 
                                disabled={!replyContent.trim() || submittingReply}
                                className={`px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold transition disabled:opacity-50`}
                            >
                                Kirim
                            </button>
                        </form>
                    )}

                    {/* Nested Level 1 Replies */}
                    {replies.length > 0 && !isCollapsed && (
                        <div className={`${isModal ? 'ml-8' : 'ml-10'} pl-3 border-l-2 border-gray-100 space-y-3`}>
                            {replies.map((replyL1) => {
                                const replyL1UserAvatar = replyL1.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                                const subReplies = replyL1.children || [];
                                const isL1Collapsed = !!collapsedComments[replyL1.id];

                                const avatarClassL1 = isModal ? "w-6 h-6 mt-0.5" : "w-6 h-6 mt-1";
                                const bubbleClassL1 = isHiddenSection
                                    ? (isModal ? "bg-amber-50/40 rounded-2xl px-2.5 py-1.5 border border-amber-100/30" : "bg-amber-50/40 rounded-2xl px-3 py-2 border border-amber-100/30 transition-colors relative")
                                    : (isModal ? "bg-gray-100/50 rounded-2xl px-2.5 py-1.5" : "bg-gray-50 hover:bg-gray-100 rounded-2xl px-3 py-2 transition-colors relative");
                                const titleClassL1 = isModal ? "font-semibold text-gray-900 text-[10px]" : "font-semibold text-gray-900 text-xs";
                                const contentClassL1 = isModal ? "text-gray-700 mt-0.5 leading-normal" : "text-gray-700 text-xs mt-1";

                                return (
                                    <div key={replyL1.id} className="space-y-3">
                                        {/* Level 1 Comment */}
                                        <div className={`flex gap-2 ${textClass} items-start group`}>
                                            <img 
                                                src={replyL1UserAvatar} 
                                                alt="avatar" 
                                                className={`${avatarClassL1} rounded-full object-cover border border-gray-50`}
                                            />
                                            <div className="flex-1">
                                                <div className={bubbleClassL1}>
                                                    <div className="flex items-center justify-between">
                                                        <span className={titleClassL1}>
                                                            {replyL1.full_name || `@${replyL1.username}`}
                                                            {isHiddenSection && <span className="text-[9px] text-amber-600 font-semibold ml-1.5 bg-amber-50 px-1 py-0.5 rounded border border-amber-100">(Sembunyikan)</span>}
                                                        </span>
                                                        <span className={dateClass}>
                                                            {moment(replyL1.created_at).fromNow()}
                                                        </span>
                                                    </div>
                                                    <p className={contentClassL1}>{replyL1.content}</p>
                                                </div>

                                                {/* Action links */}
                                                <div className={actionClass}>
                                                    <button 
                                                        onClick={() => {
                                                            setReplyingTo(replyingTo === replyL1.id ? null : replyL1.id);
                                                            setReplyContent("");
                                                        }} 
                                                        className="hover:text-indigo-600 transition"
                                                    >
                                                        Balas
                                                    </button>
                                                    {subReplies.length > 0 && (
                                                        <button 
                                                            onClick={() => toggleCollapse(replyL1.id)} 
                                                            className="hover:text-indigo-600 text-slate-400 transition"
                                                        >
                                                            {isL1Collapsed 
                                                                ? `Lihat balasan (${subReplies.length})` 
                                                                : "Sembunyikan balasan"
                                                            }
                                                        </button>
                                                    )}
                                                    {/* Hapus / Sembunyikan Balasan */}
                                                    {(replyL1.user_id === loggedInUser?.id || loggedInUser?.role === 'admin' || loggedInUser?.id === 'admin-1' || loggedInUser?.id === 'admin-2') ? (
                                                        <button 
                                                            onClick={() => handleCommentDelete(replyL1.id)}
                                                            className="hover:text-red-500 text-gray-500 transition"
                                                        >
                                                            Hapus
                                                        </button>
                                                    ) : isOwnPost ? (
                                                        <button 
                                                            onClick={() => handleHideComment(replyL1.id, !replyL1.is_hidden)}
                                                            className="hover:text-amber-600 text-gray-500 transition"
                                                        >
                                                            {replyL1.is_hidden ? "Tampilkan" : "Sembunyikan"}
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reply input under Level 1 Comment */}
                                        {replyingTo === replyL1.id && (
                                            <form onSubmit={(e) => handleReplySubmit(e, replyL1.id)} className={`flex items-center gap-2 mt-2 ml-8 animate-fade-in`}>
                                                <img 
                                                    src={currentUserProfile?.avatar_url || loggedInUser?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                                                    alt="user avatar" 
                                                    className="w-6 h-6 rounded-full object-cover border border-gray-100"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder={`Balas @${replyL1.username || 'user'}...`} 
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                                    autoFocus
                                                />
                                                <button 
                                                    type="submit" 
                                                    disabled={!replyContent.trim() || submittingReply}
                                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold transition disabled:opacity-50"
                                                >
                                                    Kirim
                                                </button>
                                            </form>
                                        )}

                                        {/* Nested Level 2 Replies (Indented once more under Level 1) */}
                                        {subReplies.length > 0 && !isL1Collapsed && (
                                            <div className="ml-8 pl-3 border-l border-gray-200/80 space-y-3">
                                                {subReplies.map((replyL2) => {
                                                    const replyL2UserAvatar = replyL2.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                                                    const parentOfReply = comments.find(c => c.id === replyL2.parent_id);
                                                    const showMention = parentOfReply && parentOfReply.id !== replyL1.id;

                                                    const avatarClassL2 = isModal ? "w-5 h-5 mt-0.5" : "w-5 h-5 mt-1";
                                                    const bubbleClassL2 = isHiddenSection
                                                        ? (isModal ? "bg-amber-50/40 rounded-2xl px-2.5 py-1.5 border border-amber-100/30" : "bg-amber-50/40 rounded-2xl px-3 py-2 border border-amber-100/30 transition-colors relative")
                                                        : (isModal ? "bg-gray-100/50 rounded-2xl px-2.5 py-1.5" : "bg-gray-50 hover:bg-gray-100 rounded-2xl px-3 py-2 transition-colors relative");
                                                    const titleClassL2 = isModal ? "font-semibold text-gray-900 text-[10px]" : "font-semibold text-gray-900 text-xs";
                                                    const contentClassL2 = isModal ? "text-gray-700 mt-0.5 leading-normal" : "text-gray-700 text-xs mt-1";
                                                    const actionClassL2 = isModal ? "flex gap-4 mt-1 pl-2 text-[9px] text-gray-500 font-semibold" : "flex gap-4 mt-1 pl-3 text-[11px] text-gray-500 font-semibold";

                                                    return (
                                                        <div key={replyL2.id} className="space-y-2">
                                                            {/* Level 2 Comment */}
                                                            <div className={`flex gap-2 ${textClass} items-start group`}>
                                                                <img 
                                                                    src={replyL2UserAvatar} 
                                                                    alt="avatar" 
                                                                    className={`${avatarClassL2} rounded-full object-cover border border-gray-50`}
                                                                />
                                                                <div className="flex-1">
                                                                    <div className={bubbleClassL2}>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className={titleClassL2}>
                                                                                {replyL2.full_name || `@${replyL2.username}`}
                                                                                {isHiddenSection && <span className="text-[9px] text-amber-600 font-semibold ml-1.5 bg-amber-50 px-1 py-0.5 rounded border border-amber-100">(Sembunyikan)</span>}
                                                                            </span>
                                                                            <span className={dateClass}>
                                                                                {moment(replyL2.created_at).fromNow()}
                                                                            </span>
                                                                        </div>
                                                                        <p className={contentClassL2}>
                                                                            {showMention && (
                                                                                <span className="text-indigo-600 font-semibold mr-1">@{parentOfReply.username}</span>
                                                                            )}
                                                                            {replyL2.content}
                                                                        </p>
                                                                    </div>

                                                                    {/* Action links */}
                                                                    <div className={actionClassL2}>
                                                                        <button 
                                                                            onClick={() => {
                                                                                setReplyingTo(replyingTo === replyL2.id ? null : replyL2.id);
                                                                                setReplyContent("");
                                                                            }} 
                                                                            className="hover:text-indigo-600 transition"
                                                                        >
                                                                            Balas
                                                                        </button>
                                                                        {/* Hapus / Sembunyikan Balasan */}
                                                                        {(replyL2.user_id === loggedInUser?.id || loggedInUser?.role === 'admin' || loggedInUser?.id === 'admin-1' || loggedInUser?.id === 'admin-2') ? (
                                                                            <button 
                                                                                onClick={() => handleCommentDelete(replyL2.id)}
                                                                                className="hover:text-red-500 text-gray-500 transition"
                                                                            >
                                                                                Hapus
                                                                            </button>
                                                                        ) : isOwnPost ? (
                                                                            <button 
                                                                                onClick={() => handleHideComment(replyL2.id, !replyL2.is_hidden)}
                                                                                className="hover:text-amber-600 text-gray-500 transition"
                                                                            >
                                                                                {replyL2.is_hidden ? "Tampilkan" : "Sembunyikan"}
                                                                            </button>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Reply input under Level 2 Comment */}
                                                            {replyingTo === replyL2.id && (
                                                                <form onSubmit={(e) => handleReplySubmit(e, replyL2.id)} className={`flex items-center gap-2 mt-2 ml-6 animate-fade-in`}>
                                                                    <img 
                                                                        src={currentUserProfile?.avatar_url || loggedInUser?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                                                                        alt="user avatar" 
                                                                        className="w-5 h-5 rounded-full object-cover border border-gray-100"
                                                                    />
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder={`Balas @${replyL2.username || 'user'}...`} 
                                                                        value={replyContent}
                                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                                        className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                                                        autoFocus
                                                                    />
                                                                    <button 
                                                                        type="submit" 
                                                                        disabled={!replyContent.trim() || submittingReply}
                                                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold transition disabled:opacity-50"
                                                                    >
                                                                        Kirim
                                                                    </button>
                                                                </form>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        });
    };

    return ( 
        <div id={`post-${postId}`} className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl hover:shadow-md transition duration-200 scroll-mt-20">
            {/* User Info */}
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
            
            {/* Content */}
            {content && (
                <div 
                    onClick={() => setIsDetailOpen(true)}
                    className="text-gray-800 text-[15px] whitespace-pre-line leading-relaxed cursor-pointer hover:text-gray-900 transition-colors" 
                    dangerouslySetInnerHTML={{__html: postWithHashtags}}
                />
            )}

            {/* Media */}
            {mediaItems.length > 0 && (
                <div onClick={() => setIsDetailOpen(true)} className="grid grid-cols-2 gap-2 mt-2 cursor-pointer hover:opacity-95 transition-opacity">
                    {mediaItems.map((item, index) => (
                        item.type === 'video' ? (
                            <video
                                key={index}
                                src={item.url}
                                controls
                                className={`w-full rounded-xl border border-gray-100 ${mediaItems.length === 1 ? 'col-span-2 h-auto max-h-[500px]' : 'h-56'} object-cover`}
                            />
                        ) : (
                            <img 
                                src={item.url} 
                                key={index} 
                                className={`w-full h-56 object-cover rounded-xl border border-gray-100 ${mediaItems.length === 1 ? 'col-span-2 h-auto max-h-[500px]' : ''}`} 
                                alt="post media" 
                            />
                        )
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 text-gray-500 text-sm pt-4 border-t border-gray-100 mt-4">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-red-500 transition-colors group" onClick={handleLike}>
                    <div className="p-1.5 rounded-full group-hover:bg-red-50 transition">
                        <Heart className={`w-[18px] h-[18px] ${likes.includes(loggedInUser?.id) ? 'text-red-500 fill-red-500' : ''}`}/>
                    </div>
                    <span className="font-medium">{likes.length}</span>
                </div>
                <div 
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 cursor-pointer transition-colors group ${showComments ? 'text-indigo-600' : 'hover:text-indigo-500'}`}
                >
                    <div className={`p-1.5 rounded-full transition ${showComments ? 'bg-indigo-50' : 'group-hover:bg-indigo-50'}`}>
                        <MessageCircle className="w-[18px] h-[18px]"/>
                    </div>
                    <span className="font-medium">{comments.length}</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-green-500 transition-colors group">
                    <div className="p-1.5 rounded-full group-hover:bg-green-50 transition">
                        <Share2 className="w-[18px] h-[18px]"/>
                    </div>
                    <span className="font-medium">7</span>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                    {/* Comment Input */}
                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                        <img 
                            src={currentUserProfile?.avatar_url || loggedInUser?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                            alt="user avatar" 
                            className="w-8 h-8 rounded-full object-cover border border-gray-100"
                        />
                        <input 
                            type="text" 
                            placeholder="Tulis komentar..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        />
                        <button 
                            type="submit" 
                            disabled={!newComment.trim() || submittingComment}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-semibold transition disabled:opacity-50"
                        >
                            Kirim
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {commentTree.length === 0 && hiddenCommentTree.length === 0 ? (
                            <p className="text-gray-400 text-xs text-center py-2">Belum ada komentar. Jadilah yang pertama!</p>
                        ) : (
                            <>
                                {renderComments(commentTree, false, false)}
                                
                                {hiddenComments.length > 0 && (
                                    <div className="pt-2 border-t border-gray-100/50 flex flex-col items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowHidden(!showHidden)}
                                            className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition bg-transparent border-none cursor-pointer py-1"
                                        >
                                            {showHidden 
                                                ? `Sembunyikan komentar yang disembunyikan` 
                                                : `Lihat komentar yang disembunyikan (${hiddenComments.length})`}
                                        </button>
                                    </div>
                                )}
                                
                                {showHidden && renderComments(hiddenCommentTree, false, true)}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Modal Overlay */}
            {isDetailOpen && (
                <div 
                    className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in"
                    onClick={() => setIsDetailOpen(false)}
                >
                    <div 
                        className="bg-white rounded-3xl overflow-hidden w-full max-w-5xl h-[85vh] flex flex-col md:flex-row shadow-2xl animate-zoom-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left Side: Media */}
                        {mediaItems.length > 0 ? (
                            <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[250px] md:min-h-0">
                                {mediaItems[0].type === 'video' ? (
                                    <video
                                        src={mediaItems[0].url}
                                        controls
                                        className="w-full h-full max-h-[85vh] object-contain"
                                    />
                                ) : (
                                    <img 
                                        src={mediaItems[0].url} 
                                        className="w-full h-full max-h-[85vh] object-contain" 
                                        alt="post media" 
                                    />
                                )}
                            </div>
                        ) : (
                            /* Styled fallback if no media */
                            <div className="md:w-2/5 bg-gradient-to-tr from-indigo-50 to-purple-50 flex items-center justify-center p-8 text-center min-h-[150px] md:min-h-0 border-r border-gray-100">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-indigo-500 text-xl font-bold">💡</div>
                                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">InSight Post</p>
                                    <p className="text-slate-400 text-xs max-w-40 leading-relaxed">Postingan berupa teks tanpa lampiran media.</p>
                                </div>
                            </div>
                        )}

                        {/* Right Side: Details & Comments */}
                        <div className="flex flex-col flex-1 h-full bg-white min-w-0">
                            {/* Header: User Profile */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div 
                                    onClick={() => { setIsDetailOpen(false); navigate('/profile/' + author._id); }} 
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <img src={author.profile_picture} alt="profile" className="w-9 h-9 rounded-full object-cover border border-gray-100"/>
                                    <div>
                                        <div className="flex items-center space-x-1">
                                            <span className="font-bold text-gray-900 text-xs hover:underline">
                                                {author.full_name}
                                            </span>
                                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500"/>
                                        </div>
                                        <div className="text-gray-500 text-[10px]">
                                            @{author.username}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsDetailOpen(false)}
                                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer text-xl font-semibold border-none bg-transparent"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Middle: Scrollable area with description & comment list */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                                {/* Post Description */}
                                <div className="text-gray-800 text-sm pb-4 border-b border-gray-100 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{__html: postWithHashtags}} />

                                {/* Comments Section */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Komentar ({comments.length})</h4>
                                    {commentTree.length === 0 && hiddenCommentTree.length === 0 ? (
                                        <p className="text-gray-400 text-xs text-center py-12">Belum ada komentar. Jadilah yang pertama!</p>
                                    ) : (
                                        <>
                                            {renderComments(commentTree, true, false)}
                                            
                                            {hiddenComments.length > 0 && (
                                                <div className="pt-2 border-t border-gray-100/50 flex flex-col items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowHidden(!showHidden)}
                                                        className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition bg-transparent border-none cursor-pointer py-1"
                                                    >
                                                        {showHidden 
                                                            ? `Sembunyikan komentar yang disembunyikan` 
                                                            : `Lihat komentar yang disembunyikan (${hiddenComments.length})`}
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {showHidden && renderComments(hiddenCommentTree, true, true)}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bottom: Post Actions & Comment Input */}
                            <div className="p-4 border-t border-gray-100 space-y-3 bg-slate-50/20">
                                {/* Actions */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-red-500 transition-colors" onClick={handleLike}>
                                        <Heart className={`w-4 h-4 ${likes.includes(loggedInUser?.id) ? 'text-red-500 fill-red-500' : ''}`}/>
                                        <span>{likes.length} Likes</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MessageCircle className="w-4 h-4"/>
                                        <span>{comments.length} Komentar</span>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Tambahkan komentar..." 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 bg-gray-100 rounded-full px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!newComment.trim() || submittingComment}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold transition disabled:opacity-50"
                                    >
                                        Kirim
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PostCard;