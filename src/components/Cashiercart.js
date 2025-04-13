import React, { useState } from "react";
import { Trash2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

function CashierCart() {
  // Cart-related states
  const [cart, setCart] = useState([]); 
  const [total, setTotal] = useState(0);
  const [cashReceived, setCashRecieved] = useState(0);
  const [change, setChange] = useState(0);
  const [lessAmount,setLessamount]=useState(false);

  // Search-related states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noSearch, setNosearch] = useState(false);
  const [searchErr, setSearcherr] = useState(false);

  const [stockObj, setStockobj] = useState({});

  // Remove item from cart and update stock object
  const handleRemoveItem = (n) => {
    setCart(cart.filter((item) => item.name !== n));
    setStockobj((prevStock) => {
      const newStockObj = { ...prevStock };
      delete newStockObj[n];
      return newStockObj;
    });
  };

  // Calculate change based on cash received
  const handleCalculateChange = () => {
    if (cashReceived === 0) {
      setCasherr(true);
      setTimeout(()=>setCasherr(false),2000);
      return;
    }
    if(cashReceived<total) {
      setLessamount(true);
      setCashRecieved(0);
      setTimeout(()=>setLessamount(false),2000);
      return;
    }
    setCarterr(false);
    setLessamount(false);
    setCashRecieved(0);
    setChange(Math.abs(total - cashReceived)); //Calculate change
  };

  // Search for items
  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults([]);
      setNosearch(true);
      setSearcherr(false);
      setTimeout(() => setNosearch(false), 2000);
      return;
    }
    try {
      const reqs = await fetch( 
        `https://ecommerce-backend-irak.onrender.com/getCart?name=${searchTerm}&detail=simple`
      );
      if (reqs.ok) {
        const res = await reqs.json();
        setNosearch(false);
        setSearcherr(false);
        setSearchResults(res);
        return;
      }
      setSearcherr(true);
      setNosearch(false);
      setSearchResults([]);
    } catch (err) {
      setSearcherr(true);
      setNosearch(false);
      setSearchResults([]);
    }
  };

  // Add or update an item in the cart (final list on the basis of which total amount will be calculated) based on selection
  const handleSelectItem = async (n, p) => {
    if (!stockObj[n]) { //If item is being added in final result for first time then only 1 quantity
      try {
        const reqs = await fetch(
          `https://ecommerce-backend-irak.onrender.com/getCart?name=${n}&detail=cart`
        );
        if (reqs.ok) {
          setCarterr(false);
          const resp = await reqs.json();
          setCart([...cart, resp]);
          setStockobj((prevStock) => ({
            ...prevStock,
            [n]: { stock: 1 },
          }));
          calcTotal(p);
          return;
        }
        setCarterr(true);
      } catch (err) {
        setCarterr(true);
      }
    } else { //If item is being added in final result not for first time then quantity + 1s
      setStockobj((prevStock) => ({
        ...prevStock,
        [n]: { stock: prevStock[n].stock + 1 },
      }));
      calcTotal(p);
    }
  };

  const clearCart = () => { //Clear cart
    setCart([]);
    setStockobj({});
    setTotal(0);
  };

  const clearValues = () => { //Clear values
    setSearchTerm("");
    setSearchResults([]);
  };

  const calcTotal = (price) => { //Calculate total price
    setTotal((prevTotal) => prevTotal + price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 py-10 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        {/* TITLE */}
        <h1 className="text-5xl font-extrabold text-center mb-8">
          {/* Neon gradient text */}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-red-600">
            Cashier Cart
          </span>
        </h1>

        {/* BACK TO HOME */}
        <Link to="/casDashboard">
          <div className="mb-6 text-center">
            <span className="text-lg underline hover:text-pink-400 transition-colors">
              Back To Home
            </span>
          </div>
        </Link>

        {/* --- SEARCH SECTION --- */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 mb-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ textShadow: "0 0 6px rgba(255,255,255,0.6)" }}
          >
            Search Items
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search for an item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/20 border border-white/20 p-3 rounded w-full sm:w-1/2
                         focus:outline-none focus:ring-2 focus:ring-pink-500
                         placeholder-gray-500 text-gray-800 shadow-md transition-all"
            />
            <button
              onClick={handleSearch}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded 
                         transform hover:scale-105 transition-all shadow-md"
            >
              Search
            </button>
            <button
              onClick={clearValues}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded 
                         transform hover:scale-105 transition-all shadow-md"
            >
              Clear Search
            </button>
          </div>

          {/* Error/No-Search Messages */}
          {noSearch && (
            <p className="text-red-400 mb-2 animate-pulse">
              Please enter a search term before searching.
            </p>
          )}
          {searchErr && (
            <p className="text-red-400 mb-2 animate-pulse">
              An error occurred while searching. Please try again.
            </p>
          )}
          {lessAmount&&(
            <p className="text-red-400 mb-2 animate-pulse">
            Cash received cannot be less than total amount
          </p>
          )}

          {/* Search Results Table */}
          <div>
            {searchResults.length === 0 ? (
              <p className="text-gray-300">No results found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-gray-200">
                  <thead>
                    <tr className="border-b border-gray-700 bg-black/30">
                      <th className="text-left p-3">Item</th>
                      <th className="text-left p-3">Price</th>
                      <th className="p-3 text-center">Add</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-700 hover:bg-white/20 
                                   transform hover:scale-[1.02] transition-all"
                      >
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3 font-medium">${item.price}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() =>handleSelectItem(item.name, item.price)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <CheckCircle className="inline-block w-6 h-6" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* --- CART SECTION --- */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 mb-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ textShadow: "0 0 6px rgba(255,255,255,0.6)" }}
          >
            Cart
          </h2>
          {cart.length === 0 ? (
            <p className="text-gray-300">No items in cart.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-gray-200">
                <thead>
                  <tr className="border-b border-gray-700 bg-black/30">
                    <th className="text-left p-3">Item</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Qty</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-white/20 
                                 transform hover:scale-[1.02] transition-all"
                    >
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 font-medium">${item.price}</td>
                      <td className="p-3 font-medium">
                        {stockObj[item.name]?.stock || 0}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.name)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="inline-block w-6 h-6" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="font-bold text-xl">
                Total:{" "}
                <span className="text-pink-400">${total.toFixed(2)}</span>
              </p>
              <button
                onClick={clearCart}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded 
                           transform hover:scale-105 transition-all shadow-md"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* --- PAYMENT SECTION --- */}
        {cart.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <input
              type="number"
              min="0"
              value={cashReceived}
              placeholder="Cash Received"
              className="bg-white/20 border border-white/20 p-3 rounded w-full sm:w-48
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         placeholder-gray-300 text-gray-800 shadow-md transition-all"
              onChange={(e) => setCashRecieved(parseFloat(e.target.value))}
            />
            <button
              onClick={handleCalculateChange}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded 
                         transform hover:scale-105 transition-all shadow-md"
            >
              Calculate Change
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-200">Change:</span>
              <span className="font-bold text-xl text-green-400">
                ${change.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setChange(0)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded 
                         transform hover:scale-105 transition-all shadow-md"
            >
              Clear Change
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CashierCart;
