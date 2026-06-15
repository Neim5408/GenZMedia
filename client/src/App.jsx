import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./pages/Layout";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import AdminDashboard from "./pages/AdminDashboard";
// import MarketPlace from "./pages/MarketPlace";
import Notifications from "./pages/Notifications";
import { Toaster } from "react-hot-toast";

// --- Komponen Pelindung (Protected Route Wrapper) ---
// Komponen kecil ini bertugas memeriksa token sebelum menampilkan halaman
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <>
      <Toaster />
      <Routes>
        {/* Rute Bebas: Login dan Register (Jika sudah login, jangan boleh ke sini lagi) */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
        />

        {/* --- Rute yang Terlindungi (Protected Routes) --- */}
        {/* Kita membungkus <Layout /> dengan <ProtectedRoute> */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Semua rute di bawah ini otomatis terlindungi karena berada di dalam Layout */}
          <Route index element={<Feed />} />
          <Route path="feed" element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          {/* <Route path="marketplace" element={<MarketPlace />} /> */}
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Route>

        {/* Jika user mengetik URL yang tidak ada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
