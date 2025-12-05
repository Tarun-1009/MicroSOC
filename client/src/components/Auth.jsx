import { useState } from 'react';
import './Auth.css';
import shieldLogo from '../assets/shield-logo.png'; 

const Auth = () => {
  // State to control the sliding panel position
  // false = Login view (default), true = Sign Up view
  const [isSignUpActive, setIsSignUpActive] = useState(false);

  return (
    <div className="auth-container-centered">
      <div className={`container ${isSignUpActive ? "right-panel-active" : ""}`} id="container">
        
        {/* ----- SIGN UP FORM CONTAINER ----- */}
        <div className="form-container sign-up-container">
          <form action="#">
            <h1>Create Account</h1>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <select 
              className="role-dropdown" > 
            <option value="analyst">Security Analyst</option>
            <option value="admin">Grid Admin</option>
            </select>
            <button className="action-btn">Sign Up</button>
          </form>
        </div>

        {/* ----- SIGN IN FORM CONTAINER ----- */}
        <div className="form-container sign-in-container">
          <form action="#">
            <h1 id="signup_head" >Sign in</h1>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Forgot your password?</a>
            <button className="action-btn">Sign In</button>
          </form>
        </div>

        {/* ----- THE SLIDING OVERLAY CONTAINER ----- */}
        <div className="overlay-container">
          <div className="overlay">
            
            {/* OVERLAY LEFT (Visible on Sign Up) */}
            <div className="overlay-panel overlay-left">
              <img src={shieldLogo} alt="MicroSOC Logo" className="overlay-logo"/>
              <h1>MICRO SOC</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost-btn" onClick={() => setIsSignUpActive(false)}>
                Sign In
              </button>
            </div>
            
            {/* OVERLAY RIGHT (Visible on Login) */}
            <div className="overlay-panel overlay-right">
              <img src={shieldLogo} alt="MicroSOC Logo" className="overlay-logo"/>
              <h1>MICRO SOC</h1>
              <p>Initialize your security clearance to access the MicroSOC Command Center</p>
              <button className="ghost-btn" onClick={() => setIsSignUpActive(true)}>
                Sign Up
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;