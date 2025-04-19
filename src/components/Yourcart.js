import React, { useEffect, useState } from "react";

const backendLink = "https://ecommerce-backend-irak.onrender.com"; //Backend link stored in a variable

function Yourcart() {
  const [products, setProducts] = useState([]); //products you have bought
  const [stocks, setStocks] = useState({}); //stock of items present in market
  const [stockOfBought, setStockbought] = useState({});  //tracking the stocks of each items the user has bought
  const [proceed,setProceed]=useState(false); //Variable for showing div of proceed to checkout ( for all items in cart)
 
  useEffect(() => {
    getUsercart(); //Set products of userCart
    getStock(); //Get stock of items in market 
    // Call function inside useEffect
  }, []);

  useEffect(()=>{
    console.log('Your current stock ! ',products);
  },[products]);

  const getStock = async () => { //Getting stocks of items in market
    console.log('getStock executed ! ');
    try {
      const reqs = await fetch(`${backendLink}/getStock`);
      if (reqs.ok) {
        const resp = await reqs.json();
        setStocks(resp); //Setting stock of item in market
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
    }
  };

  const getUsercart = async () => { //Fetch user cart
    console.log('getUsercart called ! ');
    const user_email = sessionStorage.getItem("user_email");
    console.log('User email inside getUsercart is ',user_email);
    if (!user_email) {
      alert("User not detected!");
      return false;
    }
    try {
      const reqs = await fetch(`${backendLink}/getUrcart?email=${user_email}`);
      if (reqs.ok) {
        const resp = await reqs.json();
        setProducts(Object.values(resp));
        setStockbought(resp);
        return true;
      }
      else {
        setProducts([]); //cart is empty
        setStockbought({});
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
    return false
  };

  const handleAddToCart = async (item,cat) => { //Increase quantity in cart
    console.log("Inside add to cart ! ");
    const previousState=structuredClone(stockOfBought); //previous state of our items
    const prevStock=structuredClone(stocks); //previous state of stock of items in market
    const user_email=sessionStorage.getItem('user_email');
    if(stocks[item.name].stock===0) { 
      console.log("Item quantity is finsihed in market ! ");
      return;
    }
    else { //remove stock from market
      setProducts((prev) => ( //Increment quantity by 1 ( array logic / when we are inside the array , we are automatically isndie the object at the firt index or any index )
        prev.map((i)=>
          i.name===item.name ?{
            ...i,
            quantity:(i.quantity||0)+1
          }
          :i
        )
      ));
      setStockbought((prev) => { //Incrment quantity by 1
        return {
          ...prev,
          [item.name]: {
            ...prev[item.name], // Preserve other properties of the object
            quantity: (prev[item.name]?.quantity || 0) + 1, // Increment quantity
          },
        };
      });

      setStocks((prev)=>{ //state of items in market
        return{
          ...prev,
          [item.name]:{
            ...prev[item.name],
            stock:Math.max((prev[item.name]?.stock||0)-1,0)
          }
        }
      });
      try{
      console.log('CALLING APIs ! ');
     const req2= await fetch(`${backendLink}/removeStock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name }),
      });
      localStorage.setItem("stockUp", Date.now());
    
      const reqs = await fetch(`${backendLink}/postUrCart`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json"  // ✅ Required for JSON requests!
        },
        body: JSON.stringify({ 
            name: item.name, 
            price: item.price, 
            category: cat, 
            email: user_email, 
            photo:item.photo||'/uploads/default.png',
            desc: "Inc" 
        }),
    });
    

      if(!reqs.ok||!req2.ok) { //if req is ok , run getUsercart
        console.log('Some API Failed ! , resetting states ');
        setStocks(prevStock);
        setStockbought(previousState);
        setProducts(Object.values(previousState));
        
      }
      else { //APi's successful
        console.log('Successfully fetched APIS');
      }
    }
    catch(err) { //Restore states
      setStocks(prevStock);
        setStockbought(previousState);
        setProducts(Object.values(previousState));
    }
  }
  };

  // Decrease item quantity in cart
  const decreaseQuant = async (item,cat) => {
    console.log('Inside decrementing quant');
    console.log('Value of quantity value is ',cat);
    const user_email=sessionStorage.getItem('user_email');
    const previousState=structuredClone(stockOfBought); //previous state of our items
    const prevStock=structuredClone(stocks); //previous state of stock of items in market
    if (!stocks[item.name]) {
      console.log("Item does not exist in market ! ");
      return
    };
  
    // If last item in cart, remove it
    if (cat === 1) {
      console.log('Inside last stock of item in market ! ');
      setStocks((prev)=>{ //Increment the stock in market
        return{
          ...prev,
          [item.name]:{
          ...prev[item.name],
          stock:(prev[item.name]?.stock||0)+1
          }
        }
      });
      setProducts((prev)=> //Removing the product from the products array , i.e your cart
        prev.filter((i)=>i.name!==item.name)
      );

      const reqs1=await fetch(`${backendLink}/addStock`, { //increment stock in market
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name }),
      });
  
      localStorage.setItem("stockUp", Date.now());

      const reqs=await fetch(`${backendLink}/deleteItem?email=${user_email}&name=${item.name}`);  //delete from cart

      if(!reqs.ok||!reqs1.ok) { //if any api request fails , then revert the states 
        console.log("API request failed , reverting states ! ");
        setStocks(prevStock); //Revert the state of stocks in market
        setStockbought(previousState); //Revert the state of stocksBought
        setProducts(Object.values(previousState)); //Revert the state of products you have bought
      }
      else { //Both requests are successful
        console.log('Successfully removed from cart because the stock in your cart went to 0 ,states already updated ! ');
      }
      return; //Return from function becuase it was last item in the cart
    }

    //Not last item case
    console.log('Not last item till now ! , about to update states first , then call endpoints ! ');

    setStocks((prev)=>{ //Increment the quantity of stocks in market
      return{
      ...prev,
      [item.name]:{
        ...prev[item.name],
        stock:(prev[item.name]?.stock||0)+1
      }
    }
    }
  );

  setStockbought((prev)=>{ //Decrement the quantity of stocks in your cart
    return{
      ...prev,
      [item.name]:{
        ...prev[item.name],
        quantity:Math.max((prev[item.name]?.quantity||0)-1,0) //If quantity goes in negative , math.max will pick 0 as the quantity
      }
    }
  });

  setProducts((prev)=> //Decrement the quantity of the item in products array
    prev.map(i=>
      i.name===item.name?{
        ...i,
        quantity:Math.max((i.quantity||0)-1,0)
      }:
        i
    )
  );
    // Add stock in market
    const reqs1=await fetch(`${backendLink}/addStock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: item.name }),
    });
  
    localStorage.setItem("stockUp", Date.now());

    const reqs=await fetch(`${backendLink}/postUrCart`, { //decrement quantity in ur cart
      method: "POST",
      headers: { 
        "Content-Type": "application/json"  // Required for JSON requests
    },
      body: JSON.stringify({ name:item.name, price: item.price,category:cat, email: user_email,photo:item.photo||'/uploads/default.png', desc: "Dec" }),
    });
    
    if(!reqs.ok||!reqs1.ok) { //If any api call fails then revert states
      setStocks(prevStock); //Revert state of stocks in market
      setStockbought(previousState);
      setProducts(Object.values(previousState));
    }
    else { //Both requests are successful
      console.log('Successfully decremented quantity in your cart and incremented quantity in market , states already updated ! ');
    }
  };

  const callClear=async()=>{ 
    console.log('BUTTON CLICKED ! ');
    const user_email=sessionStorage.getItem('user_email');
    const previousState=structuredClone(products); //Store previous state
    setProducts([]); //Empty cart immediately to reflect changes immediately

    if(products.length>0) {
      console.log('INSIDE IF BLOCK !');
      try{
        console.log('About to call clear cart endpoint ! ');
        const reqs=await fetch(`${backendLink}/clearCart`,{
          method:'POST',
          headers:{
             "Content-Type": "application/json" 
          },
          body:JSON.stringify({
            email:user_email
          })
        });
        if(reqs.ok) { //Empty cart , already done above
          console.log('Emptied cart successfully ! ');
          //Update the stock values in market for each item ( quantity ) the user had in cart

          //Logic to store the value of promise for each request and storing the status of each in results as an object
          const indexTracker=[]; //Array to store the indices ( which failed ) so that we can use them easily in products
          console.log('About to fetch the promises ! ');
          await Promise.all(
            previousState.map(async (element,counter) => { //Counter is the index #
              try {
                const name = element.name;
                const quantity=element.quantity;
                console.log('Updating stock for:', name);
        
                const response = await fetch(`${backendLink}/restoreItems`, { 
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: name,quantity:quantity }),
                });
        
                if (!response.ok) {
                  console.log('Ooops a req failed , inside if block of that ! ');
                  indexTracker.push(counter); //Add the index to indexTracker 
                  throw new Error(`Failed to update stock for ${name}`);
                }
                return { success: true, name };  // ✅ Success, return success info
              } catch (error) {
                console.error(`❌ Error updating stock for ${element.name}:`, error.message);
                indexTracker.push(counter); //Push again just to be on safe side ( in case try block is skipped completely)
                return { success: false, name: element.name };  // ❌ Failure, return failure info
              }
            })
          );
          //Now lets set the products to show only those which failed
          if(indexTracker.length>0) { 
            console.log('Some reqs failed , so inside if block of that , now displaying those which failed ! ');
            const failedItems = previousState.filter((_, idx) => indexTracker.includes(idx)); //Remove those which are successful
            setProducts(failedItems); //Set products to failed items
        }
        
        }
        else if(reqs.status===404) { 
          //Restore previous state
          console.log('Inside user not found else if block ');
          setProducts(previousState);
          alert('User not found ! ');
        }
        else { 
          //Restore previous state
          console.log('Inside the last else block ! ');
          setProducts(previousState);
          alert('Some error occured !' );
        }
      }
      catch(err) { 
        //Restore previous state
        setProducts(previousState);
        alert('Some error occured clearing cart ! ');
      }
    }
  };

  //Confirm one item 
  const confirmItem=async(item)=>{
    const user_email=sessionStorage.getItem('user_email');
    console.log('Inside confirmItem()!');
    console.log('Value of item name inside confirmItem is ',item.name);
    const previousState=structuredClone(stockOfBought); //Previous state of stockOfBought

    //Update UI to show changes immediately
    const {[item.name]:_,...rest}=stockOfBought; //Creates a new object rest without [item.name] key but everything else included
    setProducts(Object.values(rest));
    setStockbought(rest);

    try{
      console.log('Inside try block of confirmItem !');
      const reqs=await fetch(`${backendLink}/cartHistory`,{
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          email:user_email,
          itemsArray:[item] //passing array of single item
        })
      });
      
      if(reqs.ok) {
        const reqs1=await fetch(`${backendLink}/deleteItem?email=${user_email}&name=${item.name}`);  //Delete item from cart
        if(reqs1.ok) {
          console.log('Successfully deleted item from cart in backend (deleteUrCart working fine)!');
          localStorage.setItem('alertDisp','removeOne'); //Alert displayItems.js that one item has been removed from current user's cart 
          console.log('Successfully fetched products and userStock ! ');
          console.log('Fetching cart unsuccessful!');
        }
        else { //Revert states
          setStockbought(previousState);
          setProducts(Object.values(previousState));
        }
        console.log('Successfully inserted one item of user cart in cartHistory backend API ! ');
      }
      else { //Revert the states
         setStockbought(previousState);
         setProducts(Object.values(previousState));
      }
    }
    catch(err) {
      console.log('Some error occured inside try block of confirmItem ! ');
    }
  }

  //Confirm whole cart
  const confirmAll=async()=>{
    const user_email=sessionStorage.getItem('user_email');
    console.log('Inside confirmAll() !');
    setProceed(!proceed); //Disabale prodceeding div
    await callClear();
    const previousState=structuredClone(products); //Previous state of products
    try{
      console.log('Inside try block of confirmAll ! ');
      const reqs=await fetch(`${backendLink}/cartHistory`,{ //save cart history
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          email:user_email,
          itemsArray:products
        })
      });
      if(reqs.ok) {
        console.log('Cart history saved successfully in cartHistory backend API ! ');
      }
      else {
        setProducts(previousState); //revert state
        console.log('Cart not saved successfully ! ');
      }
    }
    catch(err) {
      console.log('Some error occured in try block of confirmAll !');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-center text-gray-800">Your Cart 🛒</h1>
      </header>

      {/* CART CONTENT */}
      <main className="bg-white shadow-lg rounded-lg p-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">Your cart is empty. Start shopping! 🛍️</p>
        ) : (
          <>
            {products.map((item, index) => { //left over here , confused bw array and products
           // console.log('Value of item is '+item +'Value of item.name is '+item.name );
              const stockAvailable = stocks[item.name] ? stocks[item.name].stock > 0 : false;

              return (
                <div key={index} className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center">
                                      {/* ✅ Image Placeholder */}
                      <div className="h-40 bg-gray-200 rounded mb-4 overflow-hidden flex justify-center items-center">
                        <img
                          src={
                            item.photo
                              ? `${backendLink}${item.photo}`
                              : `${backendLink}/uploads/default.png`
                          }
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                  <div>
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="text-gray-500">Price: ${item.price}</p>
                    <p className="mt-2 text-gray-600">Stock: {stocks[item.name]?.stock || 0}</p>
                  </div>

                  {/* QUANTITY CONTROLS */}
                  {stockAvailable ? (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => decreaseQuant(item,item.quantity)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold">
                        {stockOfBought[item.name]?.quantity || 0}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item,item.quantity)}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded"
                      >
                        +
                      </button>
                      <button onClick={()=>confirmItem(item)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                         Confirm Item 💳
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-600">Out of stock</div>
                      <span className="text-lg font-semibold">
                        {stockOfBought[item.name]?.quantity || 0}
                      </span>
                      <button
                        onClick={() => decreaseQuant(item,item.quantity)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded"
                      >
                        -
                      </button>
                      <button onClick={()=>confirmItem(item)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                        Confirm Item 💳
                       </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Displaying div of checkout */}
              {proceed && (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                      <p className="text-lg font-semibold mb-4">Do you want to confirm all orders?</p>
                      <div className="flex justify-center gap-4">
                        <button onClick={confirmAll} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                          Yes
                        </button>
                        <button onClick={()=>setProceed(!proceed)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

            {/* CHECKOUT SECTION */}
            <div className="mt-8 flex justify-between items-center">
              <button onClick={callClear} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">
                Clear Cart
              </button>
              <button onClick={()=>{
                setProceed(!proceed);
                }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                Checkout 💳
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Yourcart;
