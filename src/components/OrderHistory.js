import React from "react";
import { useState,useEffect } from "react";

const backendLink = "https://ecommerce-backend-irak.onrender.com"; //Backend link stored in a variable

function Orderhistory() {
  const [orders,setOrders]=useState([]); // Holds all the orders user ever placed

  useEffect(()=>{ 
    getUserhistory(); //Call the function which fetches user's order history
  },[]);

  const getUserhistory=async()=>{ //Fetches order history of the user
    console.log('Inside getUserhistory()');
    const user_email=sessionStorage.getItem('user_email');
    if(!user_email) {
      console.log('Couldnt fetch user_email'); 
      return;
    }
    console.log('About to fetch user history ! ');
    try{
    console.log('Inside try block of getUserhistory()');
    const reqs=await fetch(`${backendLink}/usercartHistory?email=${user_email}`);
    if(reqs.ok) {
      const resp=await reqs.json();
      setOrders(resp); //Set the orders to the order history returned
      console.log('Order history fetched successfully ! ');
      return;
    }
    console.log('User has never bought anything from this store ! ');
  }
  catch(err) {
    console.log('Inside catch block of getUserhistory()');
  }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Order History</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Order Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.name} className="border-t">
                <td className="px-6 py-4 text-sm text-gray-800">{order.name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{order.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-800">${order.price}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{order.category}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{order.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orderhistory;
