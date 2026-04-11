import "./App.css";
import loginImage from "./assets/login2.png";
import logo from "./assets/logo.png";

function App() {
  return (
    <div className="wrapper">
      <div className="login-container">

        {/* LEFT SIDE */}
        <div className="left">
          <img
            src={loginImage}
            alt="illustration"
            className="illustration"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="right">

          {/* HEADER */}
          <div className="header">
            <img src={logo} alt="logo" className="logo-img" />

            <h2>Hai, selamat datang kembali</h2>

            <p className="subtext">
              Baru di insight? <span>Daftar Gratis</span>
            </p>
          </div>

          {/* FORM */}
          <input type="email" placeholder="Contoh: email@example.com" />
          <input type="password" placeholder="Masukkan kata sandi kamu" />

          <button className="login-btn">Masuk</button>

          <p className="forgot">Lupa kata sandi?</p>

          <p className="divider">Atau masuk menggunakan</p>

          <div className="socials">
            <button className="social-btn">
              <img src="/facebook.png" alt="fb" />
            </button>

            <button className="social-btn">
              <img src="/google.png" alt="google" />
            </button>

            <button className="social-btn">
              <img src="/apple.png" alt="apple" />
            </button>
          </div>

          <div className="remember">
            <input type="checkbox" />
            <span>Ingat perangkat ini</span>
          </div>

          <p className="terms">
            Dengan melanjutkan, kamu menerima <span>Syarat Penggunaan</span> dan <span>Kebijakan Privasi kami.</span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default App;