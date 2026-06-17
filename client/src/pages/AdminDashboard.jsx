import React, { useEffect, useState } from "react";
import { authApi, userApi, postApi, commentApi } from "../utils/api";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import { 
  ShieldAlert, 
  Users, 
  Image, 
  Flame, 
  MessageSquare, 
  Search, 
  Trash2, 
  X, 
  Eye, 
  RefreshCw 
} from "lucide-react";

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [mediaItems, setMediaItems] = useState([]); // posts
  const [stories, setStories] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Peek States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // peek profile modal
  const [peekTab, setPeekTab] = useState("posts"); // posts, stories, comments
  const [dashboardTab, setDashboardTab] = useState("posts"); // global posts, stories, comments list

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, mediaRes, storiesRes, commentsRes] = await Promise.all([
        userApi.get('/user/search/all').catch(e => { console.error(e); return { data: [] }; }),
        postApi.get('/post/feeds').catch(e => { console.error(e); return { data: [] }; }),
        postApi.get('/story/all').catch(e => { console.error(e); return { data: [] }; }),
        commentApi.get('/comment/all').catch(e => { console.error(e); return { data: [] }; })
      ]);
      setMembers(usersRes.data || []);
      setMediaItems(mediaRes.data || []);
      setStories(storiesRes.data || []);
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
      Swal.fire({
        title: 'Error',
        text: 'Gagal memuat data anggota atau media.',
        icon: 'error',
        confirmButtonColor: '#1e1b4b'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMember = async (memberId) => {
    const confirm = await Swal.fire({
      title: 'Hapus Member?',
      text: 'Member ini akan dihapus permanen dari sistem beserta semua data profilnya.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });

    if (!confirm.isConfirmed) return;

    try {
      await authApi.delete(`/auth/delete/${memberId}`);
      Swal.fire({
        title: 'Berhasil',
        text: 'Member berhasil dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setMembers((prev) => prev.filter((m) => (m.id || m._id) !== memberId));
      if (selectedUser?.id === memberId) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text: 'Tidak dapat menghapus member.',
        icon: 'error',
        confirmButtonColor: '#1e1b4b'
      });
    }
  };

  const handleDeleteMedia = async (postId) => {
    const confirm = await Swal.fire({
      title: 'Hapus Postingan?',
      text: 'Postingan ini akan dihapus secara permanen dari sistem.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });

    if (!confirm.isConfirmed) return;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const deleteUserId = currentUser?.role === 'admin' ? currentUser.id : 'admin-1';

    try {
      await postApi.delete(`/post/${postId}`, {
        data: {
          user_id: deleteUserId
        }
      });
      Swal.fire({
        title: 'Berhasil',
        text: 'Postingan berhasil dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setMediaItems((prev) => prev.filter((item) => (item.id || item._id) !== postId));
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text: 'Tidak dapat menghapus postingan.',
        icon: 'error',
        confirmButtonColor: '#1e1b4b'
      });
    }
  };

  const handleDeleteStory = async (storyId) => {
    const confirm = await Swal.fire({
      title: 'Hapus Story?',
      text: 'Story ini akan dihapus secara permanen dari sistem.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });

    if (!confirm.isConfirmed) return;

    try {
      await postApi.delete(`/story/${storyId}`);
      Swal.fire({
        title: 'Berhasil',
        text: 'Story berhasil dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setStories((prev) => prev.filter((s) => s.id !== storyId));
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text: 'Tidak dapat menghapus story.',
        icon: 'error',
        confirmButtonColor: '#1e1b4b'
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirm = await Swal.fire({
      title: 'Hapus Komentar?',
      text: 'Komentar ini akan dihapus secara permanen dari platform.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });

    if (!confirm.isConfirmed) return;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const deleteUserId = currentUser.id || 'admin-1';

    try {
      await commentApi.delete(`/comment/${commentId}`, {
        data: { user_id: deleteUserId },
        params: { user_id: deleteUserId }
      });
      Swal.fire({
        title: 'Berhasil',
        text: 'Komentar berhasil dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Gagal',
        text: 'Tidak dapat menghapus komentar.',
        icon: 'error',
        confirmButtonColor: '#1e1b4b'
      });
    }
  };

  // Search filter
  const filteredMembers = members.filter(member => {
    const username = (member.username || "").toLowerCase();
    const fullName = (member.full_name || "").toLowerCase();
    const email = (member.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return username.includes(query) || fullName.includes(query) || email.includes(query);
  });

  const getMemberName = (userId) => {
    const found = members.find(m => m.id === userId);
    return found ? (found.full_name || found.username) : `@${userId}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel Moderator Utama</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1.5 ml-0.5">Pantau status, moderasi postingan, story, komentar, dan kelola member platform InSight.</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition active:scale-95 shadow"
          >
            <RefreshCw className="w-4 h-4" />
            Muat Ulang Data
          </button>
        </div>

        {/* Statistik Dashboard */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow transition">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Member</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{members.length}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow transition">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Image className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Postingan</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{mediaItems.length}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow transition">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stories Aktif</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{stories.length}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow transition">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Komentar Platform</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{comments.length}</p>
            </div>
          </div>
        </div>

        {/* Pembagian Area Kerja */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* SISI KIRI: Daftar Member + Search */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Kelola Anggota</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Klik profil member untuk deep inspection.</p>
            </div>

            {/* Input Pencarian */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari username atau nama lengkap..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List Members */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredMembers.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Tidak ada member ditemukan.</p>
              ) : (
                filteredMembers.map((member) => {
                  const id = member.id || member._id;
                  return (
                    <div 
                      key={id}
                      onClick={() => {
                        setSelectedUser(member);
                        setPeekTab("posts");
                      }}
                      className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                          alt={member.username} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                            {member.full_name || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-slate-500">@{member.username || "user"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedUser(member);
                            setPeekTab("posts");
                          }}
                          title="Deep Inspection"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(id)}
                          title="Hapus Member"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SISI KANAN: Daftar Aktivitas Global Platform */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Aktivitas Global</h2>
                <p className="text-xs text-slate-500 mt-0.5">Semua konten yang diunggah ke platform.</p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: "posts", label: "Posts" },
                  { id: "stories", label: "Stories" },
                  { id: "comments", label: "Comments" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDashboardTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      dashboardTab === tab.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Global Items */}
            <div className="flex-1 overflow-y-auto max-h-[500px] mt-4 space-y-4 pr-1">
              
              {/* Global Posts */}
              {dashboardTab === "posts" && (
                mediaItems.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">Tidak ada postingan ditemukan.</p>
                ) : (
                  mediaItems.map((item) => {
                    const id = item.id || item._id;
                    const mediaUrl = item.media_url || item.image_urls?.[0];
                    const ownerId = item.user_id || (item.user && typeof item.user === 'object' ? item.user.id : item.user);
                    return (
                      <div key={id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => {
                                const foundUser = members.find(m => m.id === ownerId);
                                if (foundUser) {
                                  setSelectedUser(foundUser);
                                  setPeekTab("posts");
                                }
                              }}
                              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              {getMemberName(ownerId)}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                          </div>
                          <p className="text-sm text-slate-800 font-medium">{item.content_text || item.content || "(Tidak ada teks)"}</p>
                          {mediaUrl && (
                            <img src={mediaUrl} alt="Post Media" className="h-32 w-48 rounded-xl object-cover border border-slate-100" />
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMedia(id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-4 rounded-full transition self-end md:self-center flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    );
                  })
                )
              )}

              {/* Global Stories */}
              {dashboardTab === "stories" && (
                stories.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">Tidak ada story ditemukan.</p>
                ) : (
                  stories.map((story) => (
                    <div key={story.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => {
                              const foundUser = members.find(m => m.id === story.user_id);
                              if (foundUser) {
                                setSelectedUser(foundUser);
                                setPeekTab("stories");
                              }
                            }}
                            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                          >
                            {getMemberName(story.user_id)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{new Date(story.created_at).toLocaleDateString('id-ID')}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-purple-100 text-purple-700">
                            {story.media_type || "text"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium">{story.content || "(Tidak ada teks)"}</p>
                        {story.media_url && (
                          <img src={story.media_url} alt="Story Media" className="h-32 w-20 rounded-xl object-cover border border-slate-100" />
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteStory(story.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-4 rounded-full transition self-end md:self-center flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  ))
                )
              )}

              {/* Global Comments */}
              {dashboardTab === "comments" && (
                comments.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">Tidak ada komentar ditemukan.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => {
                              const foundUser = members.find(m => m.id === comment.user_id);
                              if (foundUser) {
                                setSelectedUser(foundUser);
                                setPeekTab("comments");
                              }
                            }}
                            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                          >
                            {getMemberName(comment.user_id)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium">{comment.content}</p>
                        <p className="text-[10px] text-slate-400">Target Post ID: {comment.post_id}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-4 rounded-full transition self-end md:self-center flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  ))
                )
              )}

            </div>
          </div>

        </div>

      </div>

      {/* MEMBER SEARCH & "PROFILE PEEK" MODAL IMPLEMENTATION */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex gap-4 items-center">
                <img
                  src={selectedUser.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt={selectedUser.username}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                      {selectedUser.full_name || "Tanpa Nama"}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-indigo-100 text-indigo-700">
                      {selectedUser.role || "Member"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">@{selectedUser.username || "username"}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full hover:bg-slate-200 transition text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector Inside Modal */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/20">
              {[
                { 
                  id: "posts", 
                  label: "Postingan", 
                  count: mediaItems.filter(item => (item.user_id || (item.user && typeof item.user === 'object' ? item.user.id : item.user)) === selectedUser.id).length 
                },
                { 
                  id: "stories", 
                  label: "Stories", 
                  count: stories.filter(story => story.user_id === selectedUser.id).length 
                },
                { 
                  id: "comments", 
                  label: "Komentar", 
                  count: comments.filter(c => c.user_id === selectedUser.id).length 
                }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPeekTab(tab.id)}
                  className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all duration-200 relative focus:outline-none ${
                    peekTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600 font-normal border border-slate-200">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Scrollable Content Inside Modal */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              
              {/* Tab 1: Posts */}
              {peekTab === "posts" && (
                mediaItems.filter(item => (item.user_id || (item.user && typeof item.user === 'object' ? item.user.id : item.user)) === selectedUser.id).length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">User ini belum mengunggah postingan.</p>
                ) : (
                  mediaItems
                    .filter(item => (item.user_id || (item.user && typeof item.user === 'object' ? item.user.id : item.user)) === selectedUser.id)
                    .map(item => {
                      const id = item.id || item._id;
                      const mediaUrl = item.media_url || item.image_urls?.[0];
                      return (
                        <div key={id} className="p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition shadow-sm">
                          <div className="space-y-1.5 flex-1">
                            <p className="text-sm text-slate-800 font-semibold">{item.content_text || item.content || "(Tidak ada teks)"}</p>
                            {mediaUrl && (
                              <img
                                src={mediaUrl}
                                alt="Post Media"
                                className="h-24 w-40 rounded-xl object-cover border border-slate-100 shadow-sm"
                              />
                            )}
                            <p className="text-[10px] text-slate-400">Dipublikasikan: {new Date(item.created_at).toLocaleString('id-ID')}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteMedia(id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3.5 rounded-full transition flex items-center gap-1 self-end md:self-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Post
                          </button>
                        </div>
                      );
                    })
                )
              )}

              {/* Tab 2: Stories */}
              {peekTab === "stories" && (
                stories.filter(story => story.user_id === selectedUser.id).length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">User ini belum membuat story aktif.</p>
                ) : (
                  stories
                    .filter(story => story.user_id === selectedUser.id)
                    .map(story => (
                      <div key={story.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition shadow-sm">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-700 uppercase">
                              {story.media_type || "text"}
                            </span>
                            {story.background_color && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm"
                                style={{ backgroundColor: story.background_color }}
                              />
                            )}
                          </div>
                          <p className="text-sm text-slate-800 font-semibold">{story.content || "(Tidak ada teks)"}</p>
                          {story.media_url && (
                            <img
                              src={story.media_url}
                              alt="Story Media"
                              className="h-28 w-16 rounded-xl object-cover border border-slate-100 shadow-sm"
                            />
                          )}
                          <p className="text-[10px] text-slate-400 font-medium">Dibuat: {new Date(story.created_at).toLocaleString('id-ID')}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3.5 rounded-full transition flex items-center gap-1 self-end md:self-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus Story
                        </button>
                      </div>
                    ))
                )
              )}

              {/* Tab 3: Comments */}
              {peekTab === "comments" && (
                comments.filter(c => c.user_id === selectedUser.id).length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">User ini belum menulis komentar.</p>
                ) : (
                  comments
                    .filter(c => c.user_id === selectedUser.id)
                    .map(comment => (
                      <div key={comment.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition shadow-sm">
                        <div className="space-y-1.5 flex-1">
                          <p className="text-sm text-slate-800 font-medium">{comment.content}</p>
                          <p className="text-[10px] text-slate-400">Post ID: {comment.post_id}</p>
                          <p className="text-[10px] text-slate-400">Komentar dibuat: {new Date(comment.created_at).toLocaleString('id-ID')}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3.5 rounded-full transition flex items-center gap-1 self-end md:self-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus Komentar
                        </button>
                      </div>
                    ))
                )
              )}

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-850 hover:bg-slate-200 rounded-full transition"
              >
                Tutup Modul Peek
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
