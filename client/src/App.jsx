import { useState } from 'react';
import './App.css';

function App() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('analyst'); 

  const handleLogin = (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    console.log("Attempting Login:", { email, password, role });
    alert(`Connecting to Morphing Grid as: ${role.toUpperCase()}`);
    // Later, we will send this data to the Backend here.
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>MicroSOC Access</h2>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Ranger ID (Email)</label>
            <input 
              type="email" 
              placeholder="ranger@mnnit.ac.in" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Passcode</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Clearance Level</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="analyst">Security Analyst</option>
              <option value="admin">Grid Admin</option>
            </select>
          </div>

          <button type="submit" className="login-btn">
            Initialize Link
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;