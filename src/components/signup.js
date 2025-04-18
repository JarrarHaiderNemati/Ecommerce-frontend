import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import stores from '../stores.webp'

const backendLink = "https://ecommerce-backend-irak.onrender.com"; //Backend link stored in a variable

function Signup() {
  const [name, setName] = useState(""); //Stores name 
  const [email, setEmail] = useState(""); //Stores email
  const [password, setPass] = useState(""); //Stores password 
  const [confirmPassword, setConPass] = useState(""); //For confirming password
  const [role, setRole] = useState(""); //Stores role
  const [cashiers, setCashiers] = useState(false); //Displays if cashiers have exceeded by a certain limit
  const [signup, setSignup] = useState(false); //Displays signup status
  const [error, setError] = useState(false); //Displays if some error occured
  const [redirect, setRedirect] = useState(false); //Displays redirecting message
  const [loading,setLoading]=useState(false); //Displays loading while data is being sent to backend
  const [wrongEmail,setWrongEmail]=useState(false); //Displays invalid email format message

  sessionStorage.setItem("currentPage", "signup"); //Set the current page as signup

  const validateEmail = (email) => { //Validate email 
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email); //Checks if email matches the pattern of regex
  };

  const sendData = async () => { //Send form to backend
    if (!name || !email || !password || !confirmPassword || !role) {
      alert("All fields must be selected!");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if(!validateEmail(email)) {
      setWrongEmail(true);
      setTimeout(()=>{
        setWrongEmail(false);
      },1500)
      return;
    }
    try {
      setLoading(true); //Show loading / validating msg
      const req = await fetch(`${backendLink}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          name: name,
          password: password,
          role: role,
        }),
      });

      if (req.ok) {
        const resp = await req.json();
        if (resp.length === 0) {
          setLoading(false); //Hide loading msg
          setError(false);
          setCashiers(true); 
          setTimeout(() => setCashiers(false), 2000);
          setSignup(false);
          setRedirect(false);
        } else {
          setLoading(false); //Hide loading msg
          setError(false);
          setCashiers(false);
          setSignup(true);
          sessionStorage.setItem("user_email", email);
          sessionStorage.setItem("role", role);
          setTimeout(() => setRedirect(true), 2000);
        }
      } else {
        setLoading(false); //Hide loading msg
        setError(true);
        setSignup(false);
        setCashiers(false);
        setRedirect(false);
      }
    } catch (err) {
      setLoading(false); //Hide loading msg
      setError(true);
      setCashiers(false);
      setRedirect(false);
      console.error("Error occurred!");
    }
  };

  if (redirect) { //Navigate to cashier dashboard if redirect variable is true
      return <Navigate to="/casDashboard" />;
  }

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gray-900 px-4">
      {/* Background Image */}
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        src={stores}
        alt="Background"
      />

      {/* Signup Box */}
      <div className="relative z-10 bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Sign Up</h2>

        {/* Full Name Input */}
        <input
          type="text"
          value={name}
          placeholder="Full Name"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setName(e.target.value)}
        />

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
          onChange={(e) => setPass(e.target.value)}
        />

        {/* Confirm Password Input */}
        <input
          type="password"
          value={confirmPassword}
          placeholder="Confirm Password"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setConPass(e.target.value)}
        />

        {/* Role Selection */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <button
            onClick={() => setRole("Customer")}
            className={`w-full md:w-1/2 py-3 rounded-md transition ${
              role === "Customer"
                ? "bg-blue-700 text-white"
                : "bg-blue-200 text-blue-800 hover:bg-blue-500 hover:text-white"
            } ${redirect && "opacity-50 cursor-not-allowed"}`}
          >
            Customer
          </button>
          <button
            onClick={() => setRole("Cashier")}
            className={`w-full md:w-1/2 py-3 rounded-md transition ${
              role === "Cashier"
                ? "bg-green-700 text-white"
                : "bg-green-200 text-green-800 hover:bg-green-500 hover:text-white"
            }${redirect && "opacity-50 cursor-not-allowed"} `}
          >
            Cashier
          </button>
        </div>

        {/* Signup Button */}
        <button
          onClick={sendData}
          className={`w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-md
             hover:from-blue-600 hover:to-blue-800 shadow-lg transition-transform transform hover:scale-105
             ${redirect && "opacity-50 cursor-not-allowed"}`}
        >
          Sign Up
        </button>

        {/* Error Messages */}
        {cashiers && (
          <div className="bg-red-200 text-red-900 text-lg p-3 mt-4 rounded-md">
            ❌ Sorry! No more cashiers can be accommodated.
          </div>
        )}
        {wrongEmail && (
          <div className="bg-red-200 text-red-900 text-lg p-3 mt-4 rounded-md">
            Invalid Email Format!
          </div>
        )}
        {signup && (
          <div className="bg-green-200 text-green-900 text-lg p-3 mt-4 rounded-md">
            ✅ Signup successful! Redirecting...
          </div>
        )}
        {error && (
          <div className="bg-red-200 text-red-900 text-lg p-3 mt-4 rounded-md">
            ❌ Some error occurred! Try again later.
          </div>
        )}
        {loading && (
          <div className="bg-gray-200 text-xl mt-4 p-2 rounded">
            Validating...
          </div> 
        )}

        {/* Login Link */}
        <p className="text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
