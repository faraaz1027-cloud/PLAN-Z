import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginAdmin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        alert("Admin login successful");

        navigate("/admin-dashboard"); // ✅ redirect here
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.log("Login error:", err);
      alert("Server error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Login</h1>

      <input
        type="email"
        placeholder="Admin email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <button onClick={loginAdmin}>Login</button>
    </div>
  );
}

export default AdminLogin;