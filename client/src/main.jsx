import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'

// --- Safety Self-Healing Check for LocalStorage ---
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser === 'undefined' || storedUser === 'null' || storedUser === '') {
    localStorage.removeItem('user');
  } else if (storedUser) {
    JSON.parse(storedUser); // Test if it is valid JSON
  }
} catch (e) {
  console.warn("Detected and cleared corrupted user session from localStorage.");
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

try {
  const storedToken = localStorage.getItem('token');
  if (storedToken === 'undefined' || storedToken === 'null' || storedToken === '') {
    localStorage.removeItem('token');
  }
} catch (e) {
  localStorage.removeItem('token');
}

// Import your Clerk Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key in environment variables!");
  createRoot(document.getElementById('root')).render(
    <div style={{
      padding: '24px',
      margin: '40px auto',
      maxWidth: '600px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#7f1d1d',
      backgroundColor: '#fef2f2',
      border: '1px solid #fee2e2',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    }}>
      <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: 600 }}>Missing Clerk Publishable Key</h2>
      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#991b1b' }}>
        Aplikasi mendeteksi bahwa kunci Clerk (<code>VITE_CLERK_PUBLISHABLE_KEY</code>) kosong atau tidak terbaca di file <code>client/.env</code>.
      </p>
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #fca5a5',
        fontSize: '13px'
      }}>
        <strong>Cara Mengatasi:</strong>
        <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
          <li>Pastikan file <code>client/.env</code> ada dan berisi <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code></li>
          <li>Hentikan terminal <code>npm run dev</code> Anda saat ini (tekan <code>Ctrl + C</code>).</li>
          <li>Jalankan kembali <code>npm run dev</code> agar Vite memuat ulang file environment variable yang baru.</li>
        </ol>
      </div>
    </div>
  );
} else {
  createRoot(document.getElementById('root')).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  )
}