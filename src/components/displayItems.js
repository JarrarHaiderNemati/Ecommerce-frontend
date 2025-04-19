import React, { useEffect, useRef, useState } from "react";

const backendLink = "https://ecommerce-backend-irak.onrender.com"; //Backend link stored in a variable

function Displayitems() {
  const [items, setItems] = useState([]); //Items of store
  const [itemErr, setItemerr] = useState(false); //Message of error retrieinvg item
  const [itemsBought, setItemsbought] = useState({}); //for tracking the items the user has bought
  const [stocks, setStocks] = useState({}); //tracking the stock of item present in market
  const [stockOfBought,setStockbought]=useState({}); //tracking the stocks of each items the user has bought
  const [searchValue,setSearch]=useState(''); //Search bar variables
  const [discountsPresent,setDiscountsPresent]=useState({}); //Object that retrives the discounts present from backend ( same as discountExists in Cashier Dashboard )
  const [isLoading, setIsLoading] = useState(false); //Displays searching while search is ongoing

  let timeout=useRef(null) //Timeout variable for debounce effect 

  useEffect(() => {
    getItems();
    getStock();
    getUsercart();
    getDiscounts(); //Fetch discounts
  }, []);

  useEffect(()=>{
    console.log('Value is ',Object.values(stockOfBought));
  },[stockOfBought])

  window.addEventListener('storage',async(e)=>{ //Listen for when stock etc changes in other componentss
    if(e.key==='alertDisp') {
      await getUsercart();
    }
    else if(e.key==='discountChange') { //Fetch discounts again because the cashier altered discounts in his component
      await getDiscounts();
    }
  })

  const getDiscounts=async()=>{ //Fetches discounts
    console.log('Inside getDiscounts()');
    try {
      const reqs = await fetch(`${backendLink}/fetchDiscounts`);
      if (reqs.ok) {
        const resp=await reqs.json(); //Convert resp to JS object
        setDiscountsPresent(resp); // Set discount exists to the retrieved info
        console.log("Discounts fetched successfully !");
      } else if (reqs.status === 404) {
        console.log("No discounts found !");
        setDiscountsPresent({}); // Make discount exists empty
      }
    } catch (err) {
      console.log("Some error occured inside try block of fetchDiscount() !");
    }
  }

  // Get availble itesm stocks
  const getStock = async () => { 
    try {
      const reqs = await fetch(`${backendLink}/getStock`);
      if (reqs.ok) {
        const resp = await reqs.json();
        setStocks(resp);
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
    }
  };

  // Fetch items from backend
  const getItems = async () => {
    try {
      const reqs = await fetch(`${backendLink}/fetchItems`);
      if (reqs.ok) {
        const resp = await reqs.json();
        setItems(resp);
        setItemerr(false);
        return;
      }
      setItemerr(true);
      setTimeout(() => setItemerr(false), 3000);
    } catch (err) {
      setItemerr(true);
      setTimeout(() => setItemerr(false), 3000);
    }
  };

  const getUsercart=async()=>{ //Fetch ur cart
    const user_email=sessionStorage.getItem('user_email');
    console.log('Calling getUrCart ! ');
    try{
    const reqs=await fetch(`${backendLink}/getUrcart?email=${user_email}`);
    
    if(reqs.ok) {
      console.log('INSIDE reqs.ok');
      const resp=await reqs.json();
      setItemsbought(resp);
      setStockbought(resp);
      return;
    }
    else {
      return;
    }
  }
  catch(err) {
    console.log('Some fatal error occured ! ');
  }
  };

  const handleAddToCart = async (item,cat,photo) => {
    const user_email=sessionStorage.getItem('user_email');
    if(stocks[item.name].stock===0) {
      return;
    }
    else { //remove stock from market
      //Update states first for both itemsBought and stocks in market 
      const previousState=structuredClone(itemsBought); 
      //1.Updating for itemsBought
      setItemsbought((prev) => { //Increment quantity by 1
        return {
          ...prev,
          [item.name]: {
            ...prev[item.name], // Preserve other properties of the object
            quantity: (prev[item.name]?.quantity || 0) + 1, // Increment quantity
          },
        };
      });
      setStockbought((prev) => { //Incrment quantity by 1
        return {
          ...prev,
          [item.name]: {
            ...prev[item.name], // Preserve other properties of the object
            quantity: (prev[item.name]?.quantity || 0) + 1, // Increment quantity
          },
        };
      });

      const prevStateStock=structuredClone(stocks); //Deep copy of old state of stocks
      //2.Updating state for stocks in markets
      setStocks((prev)=>{
        return{
          ...prev,
          [item.name]:{
            ...prev[item.name],
            stock:Math.max((prev[item.name]?.stock||0)-1,0)
          }
        }
      });

      const stockReq = await fetch(`${backendLink}/removeStock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name }),
      });
      localStorage.setItem("stockUp", Date.now()); //Alert other components
      
      const reqs = await fetch(`${backendLink}/postUrCart`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json"  // ✅ Required for JSON requests!
        },
        body: JSON.stringify({ 
            name: item.name, 
            price: item.price, 
            category: cat.category, 
            email: user_email,
            photo:photo||"/uploads/default.png", 
            desc: "Inc" 
        }),
    });
    
    if(!stockReq.ok||!reqs.ok) { //Revert the both states of market stock and cart stock even if one API fails
      setStocks(prevStateStock);
      setItemsbought(previousState);
      setStockbought(previousState);
    }
    else { //Both apis were successful
      console.log(' Successfully removed stock from market and added stock in cart ! ');
    }
    }
  };

  const decreaseQuant = async (item,cat,photo) => {
    const user_email=sessionStorage.getItem('user_email');
    const updatedCart = structuredClone(itemsBought);
    if (!updatedCart[item.name]) return;
  
    // If last item in cart, remove it
    if (updatedCart[item.name].quantity === 1) {
      const previousState=structuredClone(itemsBought); //Previous state of items bought
      const prevStock=structuredClone(stocks); //Previous state of stocks in market
      //Update state changes immediately
      
      const {[item.name]: _,...rest}=itemsBought;
        setItemsbought(rest);
        setStockbought(rest);

        setStocks((prev)=>{
          return{
            ...prev,
            [item.name]:{
              ...prev[item.name],
              stock:(prev[item.name]?.stock||0)+1
            }
          }
        });
      
        await fetch(`${backendLink}/addStock`, { //increment stock in market
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name }),
      });
  
      localStorage.setItem("stockUp", Date.now()); //Alert other components

      const reqs=await fetch(`${backendLink}/deleteItem?email=${user_email}&name=${item.name}`);  //Delete from cart if last item
      if(!reqs.ok) { //Revert state changes
        setItemsbought(previousState);
        setStockbought(previousState);
        setStocks(prevStock);
        alert('Some issue occured while decrementing in posturcart')
        return;
      }
      return;
    }
    const previousState=structuredClone(itemsBought); //Previous state of items bought
    const prevStock=structuredClone(stocks); //Previous state of stocks in market
    //Update changes immediately
    setItemsbought((prev)=>{
      return{
        ...prev,
        [item.name]:{
          ...prev[item.name],
          quantity:Math.max((prev[item.name]?.quantity)-1,0) 
        }
      }
    });
    setStockbought((prev)=>{
      return{
        ...prev,
        [item.name]:{
          ...prev[item.name],
          quantity:Math.max((prev[item.name]?.quantity)-1,0) 
        }
      }
    });

    setStocks((prev)=>{
      return{
        ...prev,
        [item.name]:{
          ...prev[item.name],
          stock:(prev[item.name]?.stock||0)+1
        }
      }
    });
  
    // ✅ Add stock in market
    await fetch(`${backendLink}/addStock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: item.name }),
    });
  
    localStorage.setItem("stockUp", Date.now()); //Alert other components
  
    const reqs=await fetch(`${backendLink}/postUrCart`, { //decrement quantity in ur cart
      method: "POST",
      headers: { 
        "Content-Type": "application/json"  // ✅ Required for JSON requests!
    },
      body: JSON.stringify({ name:item.name, price: item.price,category:cat.category, email: user_email,photo:photo||"/uploads/default.png", desc: "Dec" }),
    });
    
    if(!reqs.ok) { //Revert the state changes
      setItemsbought(previousState);
      setStockbought(previousState);
      setStocks(prevStock);
      alert('Some issue while decrementing in posturcart ! ');
      return;
    }
  };
  
  const callSearch=async(e)=>{ //Call search function with debounce effect 
    clearTimeout(timeout.current); //Clear previous timeouts
    const value = e.target.value; //Value of search  
    console.log('Value of search is ',value);
    setSearch(e.target.value); // setting value to e.target.value
    setIsLoading(true); //Displays searching
    timeout.current=setTimeout(async()=>{ //Debounce effect ( function (and APi's in it) called when user stops typing for a certain time )
    try{
      if(value.trim()==='') { //fetch all items if no value given
        console.log('Value is empty ! ');
        setSearch(''); //Reset search variable 
        await getItems(); //Fetch all items 
        setIsLoading(false);
        return;
      }
    console.log('Inside try block of callSearch');
    const reqs=await fetch(`${backendLink}/searchItems?name=${e.target.value}`); //fetching search results from backend
    if(reqs.ok) {
      console.log('Successfully retrieved search results ! ');
      const resp=await reqs.json();
      setItems(resp); //setting items equal to the search results
      setIsLoading(false); //Dont display searching
    }
    else { //if reqs is not ok it means the item does not exist
      console.log('Search results not successful , displaying no results found and setting searchResult to empty ! ');
      setItems([]); //Should be an empty array because no such item exists
      setIsLoading(false); //Dont display searching
    }
  }
  catch(err) {
    console.log('Inside catch block ! some error occured inside try block of callSearch ! ');
    setSearch('');
  }
  },500);
}

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Store Items
        </h1>
      </header>

      {/* Search bar */}
      <input 
        type="search"
        value={searchValue}
        onChange={(e) => callSearch(e)}
        placeholder="🔍 Search for items..."
        className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
/>

      {/* Error Message */}
      {itemErr && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 text-center">
          Error fetching items.
        </div>
      )}

      {/*Displays searching... */}
      {isLoading && 
        <p className="text-center text-blue-500">Searching...</p>
      }


      {/* MAIN CONTENT */}
      <main className="space-y-8">
        {items.length === 0 && !itemErr && (
          <p className="text-center text-gray-600">No items found.</p>
        )}

        {items.map((group, index) => (
          <section key={index}>
            {/* Category Header */}
            <h2 className="text-2xl font-bold mb-4">{group.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {group.items.map((item, i) => {
                const stockAvailable = stocks[item.name] ? stocks[item.name].stock > 0 : false;

                return (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow flex flex-col"
                  >
                    {/* Image placeholder */}
                    <div className="w-full h-40 bg-gray-200 rounded mb-4 overflow-hidden flex items-center justify-center">

                    <img
                      src={item.photo ? `${backendLink}${item.photo}` 
                      : `${backendLink}/uploads/default.png`}
                      alt={item.name}
                      className="h-full w-auto object-contain"
                    />

                    </div>
                    <h3 className="text-xl font-semibold text-gray-700">
                      {item.name}
                    </h3>
                    <div className="text-sm md:text-base">
                {discountsPresent[item.name] ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Price:</span>
                      <span className="text-green-400 font-bold">
                        ${discountsPresent[item.name].discountPrice}
                      </span>
                      <span className="text-gray-400 line-through">
                        ${item.price}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">(Discounted)</div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    <span className="font-semibold">Price:</span> ${item.price}
                  </p>
                )}
              </div>

                    <p className="mt-2 text-gray-600">Stock: {stocks[item.name]?.stock || 0}</p>

                    {/* If item is not in cart, show "Add to Cart" button */}
                    {!itemsBought[item.name] ? (
                      stockAvailable ? (
                        <button
                          onClick={() => handleAddToCart(item,group,item.photo||'/uploads/default.png')}
                          className="mt-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <div>
                        <button
                          className="mt-auto bg-gray-500 text-white font-semibold py-2 px-4 rounded transition-colors cursor-not-allowed"
                          disabled
                        >
                          Out of Stock
                        </button>
                        </div>
                      )
                    ) : (
                      !stockAvailable ?(
                        <div className="mt-auto flex items-center space-x-4">
                        <button
                          className="bg-gray-500 text-white font-semibold py-2 px-4 rounded transition-colors cursor-not-allowed"
                          disabled
                        >
                          Out of Stock
                        </button>
                        <span className="font-semibold text-gray-600">
                          {stockOfBought[item.name]?.quantity || 0}
                        </span>
                      </div>

                      ):(
                        <div className="mt-auto flex items-center space-x-4">
                        <button
                          onClick={() => decreaseQuant(item,group,item.photo||'/uploads/default.png')}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                          -
                        </button>
                        <span className="font-semibold">
                          {stockOfBought[item.name].quantity}
                        </span>
                        <button
                          onClick={() => handleAddToCart(item,group,item.photo||'/uploads/default.png')}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                          +
                        </button>
                      </div>
                      )
                      // If the item is already in the cart, show minus & plus buttons with quantity
                      
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default Displayitems;