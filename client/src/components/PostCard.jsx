import React, { useState } from "react";
import { BadgeCheck, Heart, Share2, MessageCircle, Pencil } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import EditPostModal from "./EditPostModal";

// Tambahkan authorProfile di sini
const PostCard = ({ post, authorProfile, onPostUpdated }) => { 
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    
    // 1. Ambil data user yang sedang login dari brankas browser (Cukup 1 kali saja)
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    
    // 2. Cek apakah postingan ini buatan user yang sedang login (Cukup 1 kali saja)
    const isOwnPost = post?.user_id === loggedInUser?.id;

    // 3. Amankan data User pembuat postingan
    const author = {
        _id: post?.user_id || 'unknown',
        full_name: authorProfile?.full_name || post?.user?.full_name || (isOwnPost ? loggedInUser.full_name : 'InSight User'),
        username: authorProfile?.username || post?.user?.username || (isOwnPost ? loggedInUser.username : 'user'),
        profile_picture: authorProfile?.avatar_url || post?.user?.avatar_url || (isOwnPost ? loggedInUser.avatar_url : 'https://cdn-icons-png.flaticon.com/512/149/149071.png')
    };

    // 4. Amankan konten tulisan (dukung format dummy maupun database)
    const content = post?.content_text || post?.content || '';
    const postWithHashtags = content ? content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>') : '';
    
    // 5. Amankan likes array agar tidak crash saat .includes() dipanggil
    const [likes] = useState(post?.likes_count || []);

    const handleLike = async () => {
        // Logika like nanti di sini
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
        <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl hover:shadow-md transition duration-200">
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
                    <button
                        type="button"
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                )}
            </div>
            
            {/* Content */}
            {content && <div className="text-gray-800 text-[15px] whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{__html: postWithHashtags}}/>}

            {/* Media */}
            {mediaItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
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
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-500 transition-colors group">
                    <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition">
                        <MessageCircle className="w-[18px] h-[18px]"/>
                    </div>
                    <span className="font-medium">12</span>
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
        </div>
    )
}

export default PostCard;
