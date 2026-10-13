import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("attendee");

  const navigate = useNavigate();

  const signupUser = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (data.message === "Signup successful") {
      alert("Signup successful. Please login.");
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Signup</h1>

      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="attendee">Attendee</option>
        <option value="organizer">Organizer</option>
      </select>

      <button onClick={signupUser}>Signup</button>
    </div>
  );
}

export default Signup;