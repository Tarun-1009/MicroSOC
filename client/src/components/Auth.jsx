import { useState } from 'react';
import './Auth.css';
import shieldLogo from '../assets/shield-logo.png';
import authService from '../services/authService';

const Auth = () => {
    // State to control the sliding panel position
    const [isSignUpActive, setIsSignUpActive] = useState(false);

    // Form states for Sign Up
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'analyst'
    });

    // Form states for Sign In
    const [signinData, setSigninData] = useState({
        email: '',
        password: ''
    });

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle Sign Up form submission
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await authService.signup(
                signupData.name,
                signupData.email,
                signupData.password,
                signupData.role
            );

            if (result.success) {
                setSuccess('Account created successfully! Redirecting...');
                // Reset form
                setSignupData({ name: '', email: '', password: '', role: 'analyst' });

                // Redirect to dashboard or home page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/dashboard'; // Change this to your dashboard route
                }, 2000);
            } else {
                setError(result.message || 'Signup failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Sign In form submission
    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await authService.signin(
                signinData.email,
                signinData.password
            );

            if (result.success) {
                setSuccess('Login successful! Redirecting...');
                // Reset form
                setSigninData({ email: '', password: '' });

                // Redirect to dashboard or home page after 1 second
                setTimeout(() => {
                    window.location.href = '/dashboard'; // Change this to your dashboard route
                }, 1000);
            } else {
                setError(result.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Signin error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container-centered">
            <div className={`container ${isSignUpActive ? "right-panel-active" : ""}`} id="container">

                {/* ----- SIGN UP FORM CONTAINER ----- */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignUp}>
                        <h1>Create Account</h1>

                        {error && isSignUpActive && <div className="error-message">{error}</div>}
                        {success && isSignUpActive && <div className="success-message">{success}</div>}

                        <input
                            type="text"
                            placeholder="Name"
                            value={signupData.name}
                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            required
                            minLength="6"
                            disabled={loading}
                        />
                        <select
                            className="role-dropdown"
                            value={signupData.role}
                            onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                            disabled={loading}
                        >
                            <option value="analyst">Security Analyst</option>
                            <option value="admin">Grid Admin</option>
                        </select>
                        <button className="action-btn" type="submit" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                {/* ----- SIGN IN FORM CONTAINER ----- */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleSignIn}>
                        <h1 id="signup_head">Sign in</h1>

                        {error && !isSignUpActive && <div className="error-message">{error}</div>}
                        {success && !isSignUpActive && <div className="success-message">{success}</div>}

                        <input
                            type="email"
                            placeholder="Email"
                            value={signinData.email}
                            onChange={(e) => setSigninData({ ...signinData, email: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={signinData.password}
                            onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <a href="#">Forgot your password?</a>
                        <button className="action-btn" type="submit" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* ----- THE SLIDING OVERLAY CONTAINER ----- */}
                <div className="overlay-container">
                    <div className="overlay">

                        {/* OVERLAY LEFT (Visible on Sign Up) */}
                        <div className="overlay-panel overlay-left">
                            <img src={shieldLogo} alt="MicroSOC Logo" className="overlay-logo" />
                            <h1>MICRO SOC</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost-btn" onClick={() => {
                                setIsSignUpActive(false);
                                setError('');
                                setSuccess('');
                            }}>
                                Sign In
                            </button>
                        </div>

                        {/* OVERLAY RIGHT (Visible on Login) */}
                        <div className="overlay-panel overlay-right">
                            <img src={shieldLogo} alt="MicroSOC Logo" className="overlay-logo" />
                            <h1>MICRO SOC</h1>
                            <p>Initialize your security clearance to access the MicroSOC Command Center</p>
                            <button className="ghost-btn" onClick={() => {
                                setIsSignUpActive(true);
                                setError('');
                                setSuccess('');
                            }}>
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