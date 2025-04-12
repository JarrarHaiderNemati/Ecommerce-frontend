import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import stores from '../stores.webp'; //Import the stores picture from server folder

function Login() {
  const [logIn, setLoggedIn] = useState(false); //Stores log in status
  const [email, setEmail] = useState(""); //Stores email 
  const [password, setPassword] = useState(""); //Stores password 
  const [wrong, setWrong] = useState(false); //Stores wrong credentials error 
  const [error, setError] = useState(false); //Stores server error
  const [role, setRole] = useState(""); //Stores role selected
  const [redirect, setRedirect] = useState(false); //Stores redirecting status
  const [redirectMsg,setRedMSg]=useState(false); //Stores redirecting message
  const [wrongEmail,setWrongEmail]=useState(false); //Wrong email format

  const navigate = useNavigate();
  sessionStorage.setItem("currentPage", "login"); //Set current page as login

  useEffect(() => {
    if (redirect){
        navigate("/casDashboard");
    }
  }, [redirect, role]);

  const validateEmail = (email) => { //Validate email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email); //Checks if email matches the pattern of regex
  };

  const callLogin = async () => { //Call login endpoint
    if (!email || !password || !role) {
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
      },1500);
      return;
    }
    if(!validateEmail(email)) {
      setWrongEmail(true);
      setTimeout(() => {
        setWrongEmail(false);
      },1500);
      return;
    }
    setRedMSg(true);
    try {
      const req = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      if (req.ok) {
        setRedMSg(false);
        setLoggedIn(true);
        setWrong(false);
        setWrongEmail(false);
        sessionStorage.setItem("user_email", email);
        sessionStorage.setItem("role", role);
        setTimeout(() => setRedirect(true), 2000);
      } else {
        setRedMSg(false);
        setLoggedIn(false);
        setWrong(true);
        setWrongEmail(false);
        setTimeout(() => setWrong(false), 2000);
      }
    } catch (err) {
      setRedMSg(false);
      setLoggedIn(false);
      setWrong(false);
      setError(true);
      setWrongEmail(false);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gray-900 px-4">
      {/* Background Image */}
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        src={stores}
        alt="Background"
      />

      {/* Login Box */}
      <div className="relative z-10 bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Login</h2>

        {/* Email Input */}
        <input
          type="email"
          value={email}
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <input
          type="password"
          value={password}
          placeholder="Password"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Role Selection */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <button
            onClick={() => setRole("Customer")}
            className={`w-full md:w-1/2 py-3 rounded-md transition ${
              role === "Customer"
                ? "bg-blue-700 text-white"
                : "bg-blue-200 text-blue-800 hover:bg-blue-500 hover:text-white"
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setRole("Cashier")}
            className={`w-full md:w-1/2 py-3 rounded-md transition ${
              role === "Cashier"
                ? "bg-green-700 text-white"
                : "bg-green-200 text-green-800 hover:bg-green-500 hover:text-white"
            }`}
          >
            Cashier
          </button>
        </div>

        {/* Styled Login Button */}
        <button
          onClick={callLogin}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-md hover:from-blue-600 hover:to-blue-800 shadow-lg transition-transform transform hover:scale-105"
        >
          Login
        </button>

        {/* Error Messages */}
        {wrong && <div className="bg-red-200 text-xl mt-4 p-2 rounded">Invalid Credentials!</div>}
        {wrongEmail && <div className="bg-red-200 text-xl mt-4 p-2 rounded">Invalid Email Format!</div>}
        {logIn && <div className="bg-green-200 text-xl mt-4 p-2 rounded">Login Successful!</div>}
        {error && <div className="bg-red-200 text-xl mt-4 p-2 rounded">Some error occurred!</div>}
        {redirectMsg && <div className="bg-gray-200 text-xl mt-4 p-2 rounded">Checking Credentials</div> }

        {/* Signup Link */}
        <p className="text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
