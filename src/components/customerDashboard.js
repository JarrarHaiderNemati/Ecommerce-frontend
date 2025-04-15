import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const backendLink = "https://ecommerce-backend-irak.onrender.com"; //Backend link stored in a variable

function CustomerDashboard() {

  const [cusName,setCusname]=useState(''); //Customer name 
  const [cusNameerr,setCusnameerr]=useState(false); //Error retrieving customer name

  useEffect(() => {
    getCusname(); // Call function when component mounts
  }, []);

  const getCusname=async()=>{
    const user_email=sessionStorage.getItem('user_email');
    if(!user_email) {
      setCusnameerr(true);
      return;
    }
    setCusnameerr(false);
    try{
      const reqs=await fetch(`${backendLink}/cusName/${user_email}`);
      if(reqs.ok) {
        const res=await reqs.json();
        setCusname(res.name);
        return;
      }
      setCusnameerr(true);
    }
    catch(err) {
      setCusnameerr(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex flex-col">
      {/* HEADER */}
      <header className="bg-white/10 backdrop-blur-md p-6 shadow-md flex justify-center items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
          Customer Dashboard
        </h1>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 flex flex-col items-center justify-center">
        {cusNameerr?
        (<h2 className="text-xl md:text-2xl font-semibold mb-6 text-pink-300">  
        Welcome, dear customer!
      </h2>)
      :
      (<h2 className="text-xl md:text-2xl font-semibold mb-6 text-pink-300">  
          Welcome, {cusName}
        </h2>)  
        }
        

        {/* CARDS / SECTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full px-4">
          {/* PROFILE CARD */}
          <Link to='/yourCart'>
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:scale-105 transform transition-all">
            <h3 className="text-lg font-bold text-pink-200 mb-3">
              Your Profile
            </h3>
            <p className="text-sm text-gray-100">
              Manage your personal information, change passwords, and update
              your preferences.
            </p>
          </div>
          </Link>

          {/* ORDERS CARD */}
          <Link to='/items'>
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:scale-105 transform transition-all">
            <h3 className="text-lg font-bold text-pink-200 mb-3">Store</h3>
            <p className="text-sm text-gray-100">
              Explore the store and buy anything you want !
            </p>
          </div>
          </Link>
          

          {/* OFFERS CARD */}
          <Link to="/orderhistory">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:scale-105 transform transition-all cursor-pointer">
            <h3 className="text-lg font-bold text-pink-200 mb-3">
              Order History
            </h3>
            <p className="text-sm text-gray-100">
              All the orders you ever made.
            </p>
          </div>
          </Link>

          {/* FEEDBACK CARD */}
          <Link to='/feedback'>
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:scale-105 transform transition-all cursor-pointer">
            <h3 className="text-lg font-bold text-pink-200 mb-3">Feedback</h3>
            <p className="text-sm text-gray-100">
              Let us know how we can improve your experience!
            </p>
          </div>
          </Link>

          {/* FEEDBACK FROM OTHERS CARD */}
          <Link to='/othersfeedback'>
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:scale-105 transform transition-all cursor-pointer">
            <h3 className="text-lg font-bold text-pink-200 mb-3">Feedback From Others</h3>
            <p className="text-sm text-gray-100">
              List of feedback from others!
            </p>
          </div>
          </Link>
        </div>
      </main>
      

      {/* FOOTER */}
      <footer className="bg-white/10 backdrop-blur-md p-4 text-center text-sm text-gray-200">
        © {new Date().getFullYear()} MangoMerce
      </footer>
    </div>
  );
}

export default CustomerDashboard;
