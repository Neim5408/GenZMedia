import "./App.css";
import loginImage from "./assets/login.jpg";

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
          <h3 className="logo">myEdlinks</h3>

          <h2>Hai, selamat datang kembali</h2>
          <p className="subtext">
            Baru di myEdlinks? <span>Daftar Gratis</span>
          </p>

          <input type="email" placeholder="Contoh: email@example.com" />
          <input type="password" placeholder="Masukkan kata sandi kamu" />

          <button className="login-btn">Masuk</button>

          <p className="forgot">Lupa kata sandi?</p>

          <p className="divider">Atau masuk menggunakan</p>

          <div className="socials">
            <button className="social-btn"></button>
            <button className="social-btn"></button>
            <button className="social-btn"></button>
          </div>

          <div className="remember">
            <input type="checkbox" />
            <span>Ingat perangkat ini</span>
          </div>

          <p className="terms">
            Dengan melanjutkan, kamu menerima <span>Syarat Penggunaan</span> dan <span>Kebijakan Privasi</span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default App;