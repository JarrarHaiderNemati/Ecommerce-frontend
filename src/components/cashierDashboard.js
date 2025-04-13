import React, { useEffect, useState,useRef} from "react";
import {
  ShoppingCart,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

function CashierDashboard() {
  const [prodName, setProdname] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  const [products, setProducts] = useState([]); //List of all products
  const [dropdown, setDropdown] = useState({}); //Dropdown options
  const [noresult, setNoresult] = useState(false); //No result messgae
  const [error, setError] = useState(false); //Error message
  const [missData, setMissData] = useState(false); //Missing data message
  const [itemExists, setItemExists] = useState(false); //Item already exists message
  const [compData, setCompData] = useState(false); //Not Complete data message

  const [incStockerr, setInstock] = useState(false); // Error while increasing stock
  const [decStockerr, setDecstock] = useState(false); // Error while decreasing stock
  const [negStock, setNegstock] = useState(false); // Trying to decrease below zero

  const [delError, setDelError] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // is the modal open?
  const [originalItemName, setOriginalItemName] = useState(""); // current name in DB
  const [editItemName, setEditItemName] = useState(""); // new name user enters
  const [editErr, setEditErr] = useState(false); // error if edit fails
  const [discountExists, setDiscountexists] = useState({}); // Object to track if an item has a discount already present and also the discount price
  const [discountModal, setDiscountModal] = useState(false); // Flag to show or hide discount modal
  const [itemName, setItemname] = useState(""); // Tracks the name of the item being discounted
  const [itemCat, setItemcat] = useState(""); // Temp variable to store category
  const [itemPrice, setItemprice] = useState(0.0); // Temp variable to store item price
  const [discount, setDiscount] = useState(0.0); // Temporary value for discount price
  const [discountLimit,setDiscountLimit]=useState(false); //Red msg to be shown when discount is entered to be 0
  const [noDiscount,setNodiscount]=useState(false); //Msg to be shown when no discount is entered
  const [photoFile, setPhotoFile] = useState(null);       // to store the selected file
  const [photoPreview, setPhotoPreview] = useState("");   // to store preview URL
  const fileInputRef = useRef(null); //A file input ref which is triggered when a cashier clicks upload photo for an item already added
  const [selectedItem, setSelectedItem] = useState({ name: "", category: "" }); //To remember for which item the user is choosing a photo when item is alreadya added
  const [saveCat,setSavecat]=useState(''); //Stores category of item being edited

  useEffect(() => {
    fetchData();
    fetchDiscount();
  }, []);

  window.addEventListener("storage", (e) => { //Listens for stock changes in components
    if (e.key === "stockUp") {
      fetchData();
    }
  });

  const handleIncreaseStock = async (item,cat) => { //Increase stock
    console.log('Value of category is ',cat);
    const previousState=structuredClone(products); //Previous state
    
    //Update state immediately
    setProducts((prev)=>
      prev.map((categ)=>
        categ.category===cat?{
          ...categ,
          items:categ.items.map((i)=>
            i.name===item.name ?{
              ...i,
              stock:i.stock+1
            }
            : i 
          )
        }
        :
          categ
      )
    );
    setInstock(false); //Set error in incrmeeting stock to false as well
    try {
      const reqs = await fetch("https://ecommerce-backend-irak.onrender.com/addStock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name }),
      });
      if (reqs.ok) { //Products already set
        console.log('Successfully incremented stock as well ! ');
        return;
      }
      // If not OK, then revert states
      setProducts(previousState); //Set products to previous state
      setInstock(true); //Set error in stock to true and after 2 seconds disable the msg
      setTimeout(() => setInstock(false), 2000);
    } catch (err) {
      setProducts(previousState); //Set products to previous state
      setInstock(true); //Set error in stock to true and after 2 seconds disable the msg
      setTimeout(() => setInstock(false), 2000);
    }
  };

  // Decrease stock
  const handleDecreaseStock = async (item,cat) => {
    if (item.stock === 0) {
      // If stock is 0, show "cannot reduce below zero" message
      setNegstock(true);
      setTimeout(() => setNegstock(false), 2000);
      return;
    }
    console.log('Value of category is ',cat);
    const previousState=structuredClone(products); //Previous state
    //Update state immediately (logic is differnet for array than products)
    setProducts((prev)=>
      prev.map((categ)=>
        categ.category===cat?{
          ...categ,
          items:categ.items.map((i)=>
            i.name===item.name ?{
              ...i,
              stock:i.stock-1
            }
            : i 
          )
        }
        :
          categ
      )
    );
    setDecstock(false); //Dont display error msg of decreasing cart
    setNegstock(false);

    try {
      const reqs = await fetch("https://ecommerce-backend-irak.onrender.com/removeStock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name }),
      });
      if (reqs.ok) {
        console.log('Successfully decremented stock ! ');
        return;
      }
      // If not OK, revert states
      setProducts(previousState);
      setDecstock(true);
      setTimeout(() => setDecstock(false), 2000);
    } catch (err) {
      setProducts(previousState);
      setDecstock(true);
      setTimeout(() => setDecstock(false), 2000);
    }
  };

  const stateChange = (category) => { //Changes chevrons of dropdown
    setDropdown((prevState) => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  // Fetch all items
  const fetchData = async () => {
    try {
      const reqs = await fetch("https://ecommerce-backend-irak.onrender.com/fetchItems");
      if (reqs.ok) {
        const data = await reqs.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Some error occurred!", err);
      alert("Some error occurred fetching data !");
    }
  };

  // Delete an item
  const deleteItem = async (name,cat) => {
    console.log('Inside deleteItem()');
    const previousState=structuredClone(products);

    //Update state immediately / logic for deleting item
    setProducts((prev)=>
      prev.map((categ)=>
        categ.category===cat?{
          ...categ,
          items:categ.items.filter((val)=>val.name!==name)
        }:
        categ 
      )
    );
    try { 
      console.log('Inside try block of deleteItem()');
      const response = await fetch(
        `https://ecommerce-backend-irak.onrender.com/deleteItem?name=${name}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) { //Revert states 
        console.log('!ok returned ');
        setDelError(true);
        setProducts(previousState);
        setTimeout(() => setDelError(false), 2000);
        return;
      }
      
    } catch (err) {
      console.log('Inside catch block of deleteItem');
      console.error("Error deleting item!", err);
      setDelError(true);
      setProducts(previousState);
      setTimeout(() => setDelError(false), 2000);
    }
  };

  const openEditModal = (item,cat) => { //Displays editing modal which saves variables of which item is being edited
    setOriginalItemName(item.name); // store the old name
    setEditItemName(item.name); // fill the input with current name
    setShowEditModal(true);
    setSavecat(cat);
    setEditErr(false);
  };

  const closeEditModal = () => { //Hides the editing modal
    setShowEditModal(false);
    setOriginalItemName("");
    setEditItemName("");
    setSavecat('');
    setEditErr(false);
  };

  const handleSaveEdit = async () => { //Handles edits we made

    //Update UI Immediately
    const prevState=structuredClone(products); //Previous state of products
    setProducts((prev) =>
      prev.map((item) =>
        item.category === saveCat
          ? {
              ...item,
              items: item.items.map((i) =>
                i.name === originalItemName
                  ? { ...i, name: editItemName }
                  : i
              ),
            }
          : item
      )
    );
    

    try {
      const reqs = await fetch("https://ecommerce-backend-irak.onrender.com/editItems", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: originalItemName, // old name
          newName: editItemName, // new name
        }),
      });

      if (!reqs.ok) {
        setProducts(prevState); //Revert the state
        setEditErr(true);
        setTimeout(() => setEditErr(false), 2000);
        return;
      }
      // If successful, close modal
      closeEditModal();
    } catch (err) {
      setEditErr(true);
      setTimeout(() => setEditErr(false), 2000);
    }
  };

  // Add new item
  const addItem = async () => {
    if (!prodName || !stock || !price || !category||!photoFile) {
      setMissData(true);
      setTimeout(() => setMissData(false), 2000);
      return;
    }

    const imageURL=await uploadImg();
    if(!imageURL) {
      return;
    }
    try {
      const reqs = await fetch("https://ecommerce-backend-irak.onrender.com/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prodName,
          stock: Number(stock),
          price: Number(price),
          category,
          photo:imageURL
        }),
      });
      const resp = await reqs.json();
      if (!reqs.ok || (Array.isArray(resp) && resp.length === 0)) {
        setItemExists(true);
        setTimeout(() => setItemExists(false), 2000);
        return;
      }
      setCompData(true);
      fetchData();
      setPrice("");
      setStock("");
      setCategory("");
      setProdname("");
      setPhotoFile(null);
      setPhotoPreview("");
      setTimeout(() => setCompData(false), 2000);
    } catch (err) {
      alert("Some error occurred!");
      console.error("Some error occurred!", err);
    }
  };

  // Search for items based on name and category
  const searchData = async () => {
    if (!search || !searchCategory) {
      // If search field or category is empty, fetch all items
      fetchData();
      return;
    }
    try {
      const reqs = await fetch(
        `https://ecommerce-backend-irak.onrender.com/searchItems?category=${searchCategory}&name=${search}`
      );
      if (reqs.ok) {
        const resp = await reqs.json();
        setProducts(resp.length > 0 ? resp : []);
        setNoresult(resp.length === 0);
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const addNewdiscount = async (name, cat, price) => {
    if(discount<=0) { //If discount is entered as 0 , then display the red message showing discount cant be 0
      if(discount==='') { //If no value in input field of discount
        setNodiscount(true); //If no discount is entered , then display the red message showing please enter a discount
        setTimeout(()=>setNodiscount(false),2000); //Disable the msg
        setDiscount(0.0); //Reset discount
        return;
    }
    //If value is present but it is 0
      setDiscountLimit(true); //Enable red msg for discount ! 0
      setTimeout(()=>setDiscountLimit(false),2000); //Disable the msg
      setDiscount(0.0); //Reset discount
      return;
    }
    if(discount>=price) { //Discount can not be greater than or equal to actual price
      alert('Discount can not be equal to or greater than the actual price ! ');
      return;
    }
    console.log("Inside addNewdiscount ! Value of name is ",name," and value of category is ",cat," and value of price is ",price);
    try {
      console.log("Inside try block of addNewdiscount");
      const reqs = await fetch("https://ecommerce-backend-irak.onrender.com/addDiscount", {
        // Adding new discount
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          category: cat,
          price: price,
          discountPrice: discount,
        }),
      });
      if (reqs.ok) {
        console.log("Successfully added new discount !");
        localStorage.setItem('discountChange','altered'); //Notify other components that discount has been updated 
        setDiscount(0.0); // Reset discount value
        setItemname(""); // Reset item name (which tracks which item is being discounted)
        setItemprice(0.0); // Reset the item price
        setDiscountModal(false); // Hide the discount modal
        setItemcat(""); // Reset the item category
        await fetchDiscount(); // Call fetchDiscount
      }
    } catch (err) {
      console.log("Inside catch block of addNewdiscount !");
      setDiscount(0.0);
      setItemname("");
      setItemprice(0.0);
      setItemcat("");
    }
  };

  const fetchDiscount = async () => { //Fetches items that have a discount
    console.log("Inside fetchDiscount function !");
    try {
      const reqs = await fetch("https://ecommerce-backend-irak.onrender.com/fetchDiscounts");
      if (reqs.ok) {
        const resp=await reqs.json(); //Convert resp to JS object
        setDiscountexists(resp); // Set discount exists to the retrieved info
        console.log("Discounts fetched successfully !");
      } else if (reqs.status === 404) {
        console.log("No discounts found !");
        setDiscountexists({}); // Make discount exists empty
        
      }
    } catch (err) {
      console.log("Some error occured inside try block of fetchDiscount() !");
    }
  };

  const callSetdiscount = (value) => { // Set discount and check if it is a number
    if (isNaN(value)) {
      return;
    }
    setDiscount(value);
  };

  const setValues = (item, cat) => { // Set the values of the item being currently discounted and also display the modal
    setItemname(item.name);
    setItemcat(cat);
    setItemprice(item.price);
    setDiscountModal(true);
  };

  const removeDiscount = async (name) => { //Remove the disocunt
    console.log("Inside removeDiscount() , value of name of item whose discount is to be removed is ",name);
    const previousState=structuredClone(discountExists);
    const { [name]: _, ...rest } = discountExists; // Creates a new object without the `name` key
    setDiscountexists(rest); // Sets state with a truly new object

    try {
      console.log("Inside try block of removeDiscount()");
      const reqs = await fetch(`https://ecommerce-backend-irak.onrender.com/removeDiscount?name=${name}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      });
      if (reqs.ok) {
        localStorage.setItem('discountChange','altered'); //Notify other components that discount has been updated 
        console.log("Successfully deleted discount from DB !");
      }
      else { //Restore previous state
        setDiscountexists(previousState);
      }
    } catch (err) {
      setDiscountexists(previousState); //Restore previous state
      console.log("Inside catch block of removeDiscount()");
    }
  };

  const handlePhotoChange=(e)=>{ //Handles photochange , i.e choosing a pic
    const file=e.target.files[0];
    if(file) {
      setPhotoFile(file); //store the actual file (can be used for uploading)
      setPhotoPreview(URL.createObjectURL(file)); //generate a preview
    }
  };

  const uploadImg=async()=>{
    if(!photoFile) { //If no file selected , return
      return;
    }
    const formData=new FormData(); //Used for images , pdfs etc
    formData.append('photo',photoFile);

    try{
      console.log('Inside try block of uploadImg!');
      const res = await fetch("https://ecommerce-backend-irak.onrender.com/uploadPhoto", {
      method: "POST",
      body: formData,
    });
    
    if(res.ok) {
      const data=await res.json();
      console.log('Uploading successful from backend ! ');
      return data.link; //Return the relative path
    }
    else {
      console.log('Uploading unsuccessful ! ');
      alert("Failed to upload image!");
      return null; //Return null as path
    }
  }
  catch(err) {
     console.error("Img upload failed", err);
     return null; //Return null as path
  }
};

const removePhoto=async (name,cat)=>{ //Remove photo of item
  //Update the UI to remove the photo
  
  const previousState=structuredClone(products); //Save the previous state
  setProducts((prev)=>
    prev.map((c)=>
      c.category===cat?{
        ...c,
        items:c.items.map((i)=>
          i.name===name?{
            ...i,
            photo:null
          }:i 
        )
      }:c
    )
  );

  try{
  //Call the endpoint to actually delete the photo from backend
  console.log('Inside try block of removePhoto ! ');  
  const reqs=await fetch('https://ecommerce-backend-irak.onrender.com/deletePhoto',{
    method:'DELETE',
    headers: {
      "Content-Type": "application/json"
    },
    body:JSON.stringify({
      name:name
    })
  });

  if(!reqs.ok) { //Revert the states
    setProducts(previousState);
    return;
  }
  console.log('Photo removed successfully ! ');
}
catch(err) {
  console.log('Inside catch block of removePhoto',err);
}
};

const uploadPhoto=async (name,cat)=>{ //Simulates as if input is clicked , then later on calls backend
  setSelectedItem({name:name,category:cat}); //This the item for whom we are choosing a pic
  fileInputRef.current.click(); //Trigger the image choosing input
};

const handlePhotoChange2=async (e)=>{ //Onchange event for 2nd photo input tag , for items that have already been added and want to edit pic
  const file=e.target.files[0];
  if(!file||!selectedItem.name||!selectedItem.category) { //If photo is not selected properly or we dont know for which we are choosing a photo
    return;
  }
  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch("https://ecommerce-backend-irak.onrender.com/uploadPhoto", {
      method: "POST",
      body: formData
    });

    if(!res.ok) { //The first request failed
      console.log('/uploadPhoto failed ! ');
      return;
    }
    const data=await res.json(); //Extract the data
    const previousState=structuredClone(products); //Previous state of products
    const previousSelectedItem=structuredClone(selectedItem);
    setProducts((prev) => //Update the UI before the 2nd call
        prev.map((cat) =>
          cat.category === selectedItem.category
            ? {
                ...cat,
                items: cat.items.map((i) =>
                  i.name === selectedItem.name ? { ...i, photo: data.link } : i
                ),
              }
            : cat
        )
      );
      setSelectedItem({name:'',category:''}); //No item selected now 
    const res2=await fetch('https://ecommerce-backend-irak.onrender.com/updatePhoto',{
      method:'PUT',
      headers:{
        'content-type':'application/json'
      },
      body:JSON.stringify({
        name:selectedItem.name,
        photoLink:data.link
      })
    });

    if (!res2.ok) { //If 2nd request fails then revert the state , because the 1st request failure is already checked above 
      console.log('/updatePhoto failed ! ');
      setProducts(previousState);
      setSelectedItem(previousSelectedItem);
    }
  } catch (err) {
    console.log("Upload failed", err);
    setSelectedItem({name:'',category:''}); //No item selected now 
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex flex-col">
      {/* HEADER */}
          <header className="bg-white/10 backdrop-blur-md p-4 shadow-md flex justify-between items-center rounded-md m-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
          Cashier Dashboard
        </h1>

        {/* Right-side controls */}
        <div className="flex items-center gap-4">
          <Link to="/cashierFeedback">
            <button className="bg-gray-800 text-white py-2 px-6 rounded-xl shadow hover:bg-gray-600 transition-all duration-300">
              Feedbacks
            </button>
          </Link>

          <Link to="/shoppingCart">
            <ShoppingCart
              className="w-7 h-7 cursor-pointer hover:text-pink-300 transition-transform hover:scale-110"
              title="Go to Shopping Cart"
            />
          </Link>
        </div>
      </header>

      {/* ADD NEW ITEM SECTION */}
      <div className="bg-white/10 backdrop-blur-md shadow-md rounded-md m-4 p-4">
        <h2 className="text-lg md:text-xl font-semibold mb-2 text-pink-300">
          ➕ Add New Item
        </h2>
        {/* Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="Item Name"
            className="bg-white/20 border border-white/20 text-black placeholder-gray-500 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
            value={prodName}
            onChange={(e) => setProdname(e.target.value)}
          />
          <input
            type="text"
            placeholder="Price"
            className="bg-white/20 border border-white/20 text-black placeholder-gray-500 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="text"
            placeholder="Stock"
            className="bg-white/20 border border-white/20 text-black placeholder-gray-500 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <label className="bg-white/20 border border-white/20 text-white p-2 rounded w-full cursor-pointer text-sm font-medium hover:bg-white/30 transition-all text-center">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>


          <select
            className="bg-white/20 border border-white/20 text-black placeholder-gray-500 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Food">Food</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
          <button
            onClick={addItem}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center transform hover:scale-105 transition-all"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Add Item
          </button>
        </div>
        {/*Show a preview after photo is selected  */}
        {photoPreview && (
          <div className="relative inline-block w-24 h-24 mt-2">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover rounded border border-white/30"
            />
            <button
              onClick={()=>{setPhotoPreview('');setPhotoFile(null)}}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-all"
              title="Remove Photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 8.586L4.707 3.293a1 1 0 10-1.414 1.414L8.586 10l-5.293 5.293a1 1 0 101.414 1.414L10 11.414l5.293 5.293a1 1 0 001.414-1.414L11.414 10l5.293-5.293a1 1 0 00-1.414-1.414L10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {missData && (
          <p className="text-red-400 mt-2 animate-pulse">
            Please enter all fields!
          </p>
        )}
        {itemExists && (
          <p className="text-red-400 mt-2 animate-pulse">
            Item already exists!
          </p>
        )}
        {compData && (
          <p className="text-green-400 mt-2">Item added successfully!</p>
        )}
      </div>

      {/* SEARCH ITEMS SECTION */}
      <div className="bg-white/10 backdrop-blur-md shadow-md rounded-md m-4 p-4">
        <h2 className="text-lg md:text-xl font-semibold mb-2 text-pink-300">
          🔍 Search Items
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Search by name"
            className="bg-white/20 border border-white/20 text-black placeholder-gray-500 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="bg-white/20 border border-white/20 text-black placeholder-gray-500 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Food">Food</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={searchData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center transform hover:scale-105 transition-all"
            >
              <Search className="w-5 h-5 mr-2" /> Search
            </button>
            <button
              onClick={() => {
                setSearch("");
                setSearchCategory("");
                fetchData();
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transform hover:scale-105 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
        {noresult && (
          <p className="text-red-400 mt-2 animate-pulse">No items found.</p>
        )}
        {error && (
          <p className="text-red-400 mt-2 animate-pulse">
            An error occurred while searching.
          </p>
        )}
      </div>

      {/* Discount Modal */}
      {discountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-md w-full max-w-md text-white">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-pink-300">
            Set Discount
          </h2>
          <p className="mb-4 text-gray-300">
            Setting discount for{" "}
            <span className="font-medium">{itemName}</span> (Original price: ${itemPrice})
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Discount Price</label>
            <input
              type="text"
              value={discount}
              onChange={(e) => callSetdiscount(e.target.value)}
              className="w-full p-2 border border-white/20 rounded bg-white/20 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Enter discount price"
            />
          </div>
          {discountLimit && (
            <div className="mb-4 text-red-500 text-sm font-medium">
              Discount cannot be 0 or a negative value
            </div>
          )}
          {noDiscount && (
            <div className="mb-4 text-red-500 text-sm font-medium">
              Please enter a discount !
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDiscountModal(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transform hover:scale-105 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => addNewdiscount(itemName, itemCat, itemPrice)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transform hover:scale-105 transition-all"
            >
              Set Discount
            </button>
          </div>
        </div>
      </div>
      
      )}

      {/* DISPLAY AVAILABLE ITEMS */}
      <div className="flex-grow m-4">
        <h2 className="text-lg md:text-xl font-semibold mb-2 text-pink-300">
          Available Items
        </h2>

        {/* Stock / Delete Errors */}
        {incStockerr && (
          <p className="text-red-400 mb-2 animate-pulse">
            Error while increasing stock. Please try again.
          </p>
        )}
        {decStockerr && (
          <p className="text-red-400 mb-2 animate-pulse">
            Error while decreasing stock. Please try again.
          </p>
        )}
        {negStock && (
          <p className="text-red-400 mb-2 animate-pulse">
            Cannot decrease stock below zero!
          </p>
        )}
        {delError && (
          <p className="text-red-400 mb-2 animate-pulse">
            Error while deleting item. Please try again.
          </p>
        )}

        <div className="bg-white/10 backdrop-blur-md shadow-md p-4 rounded-md space-y-4">
          {products.length > 0 ? (
            products.map((categoryData, index) => {
              if (categoryData.items.length === 0) return null; // Skip empty categories {/*Check if the items array is empty or not */}
              return(
              <div key={index} className="border-b border-white/20 pb-2">
              
                <button
                  onClick={() => stateChange(categoryData.category)}
                  className="flex justify-between w-full text-base md:text-lg font-medium text-pink-200 hover:text-pink-300 transition-colors"
                >
                  {categoryData.category}
                  {dropdown[categoryData.category] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {dropdown[categoryData.category] && (
                  <ul className="mt-2 pl-4 text-gray-100 space-y-2">
                    {categoryData.items.map((item, i) => (
                      <li
                        key={i}
                        className="border border-white/20 p-2 rounded-md bg-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-2"
                      >
                        <img
                            src={
                              item.photo
                                ? `https://ecommerce-backend-irak.onrender.com${item.photo}`
                                : `https://ecommerce-backend-irak.onrender.com/uploads/default.png`
                            }
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded border border-white/20"
                          />
                        <div className="text-sm md:text-base">
                    <div className="font-semibold">{item.name}</div>
                    <div>
                      {discountExists[item.name] ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold">
                            ${discountExists[item.name].discountPrice}
                          </span>
                          <span className="text-gray-400 line-through">
                            ${item.price}
                          </span>
                          <span className="text-xs">(Discounted)</span>
                        </div>
                      ) : (
                        <span>${item.price}</span>
                      )}
                    </div>
                    <div className={item.stock === 0 ? "text-red-500" : "text-gray-300"}>
                      {item.stock === 0 ? "Out of stock!" : `Stock: ${item.stock}`}
                    </div>
                  </div>
                        <div className="flex gap-2">
                          {/* Decrement stock */}
                          <button
                            onClick={() => handleDecreaseStock(item,categoryData.category)}
                            className="text-orange-400 hover:text-orange-300 transition-transform hover:scale-110"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                          {/* Increment stock */}
                          <button
                            onClick={() => handleIncreaseStock(item,categoryData.category)}
                            className="text-green-400 hover:text-green-300 transition-transform hover:scale-110"
                          >
                            <PlusCircle className="w-5 h-5" />
                          </button>
                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(item,categoryData.category)}
                            className="text-blue-400 hover:text-blue-300 transition-transform hover:scale-110"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          {/* Delete button */}
                          <button
                            onClick={() => deleteItem(item.name,categoryData.category)}
                            className="text-red-400 hover:text-red-300 transition-transform hover:scale-110"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          {/*Show upload button if image is not present and remove button if present */}
                          {item.photo ? (
                              <button
                                onClick={() => removePhoto(item.name, categoryData.category)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-transform hover:scale-105"
                              >
                                Remove Photo
                              </button>
                            ) : (
                              <button
                                onClick={() => uploadPhoto(item.name, categoryData.category)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-transform hover:scale-105"
                              >
                                Upload Photo
                              </button>
                            )}

                        </div>
                        <div>
                          {!discountExists[item.name] ? (
                            <button
                              onClick={() => setValues(item, categoryData.category)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md transition-transform hover:scale-105"
                            >
                              Add Discount
                            </button>
                          ) : (
                            <button
                              onClick={() => removeDiscount(item.name)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-transform hover:scale-105"
                            >
                              Remove Discount
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                    
                  </ul>
                )}
              </div>
          )
})
          ) : (
            <p className="text-gray-300">No items available.</p>
          )}
          <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handlePhotoChange2}
                          className="hidden"
                     />
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md text-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-pink-300">
              Edit Item Name
            </h2>
            <input
              type="text"
              className="bg-white/20 border border-white/20 text-black placeholder-gray-500 p-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transform hover:scale-105 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transform hover:scale-105 transition-all"
              >
                Save
              </button>
            </div>
            {editErr && (
              <p className="text-red-400 mt-4 animate-pulse">
                Error updating item. Please try again.
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default CashierDashboard;
