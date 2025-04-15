import React, { useEffect, useState } from "react";

const backendLink = "https://ecommerce-backend-irak.onrender.com"; //Backend link stored in a variable

function FeedbackForm() {
  const [name, setName] = useState(""); //username
  const [email,setEmail]=useState(''); //User email
  const [rating, setRating] = useState(0); //star rating
  const [message, setMessage] = useState(""); //message
  const [submitted, setSubmitted] = useState(false); //has message been submitted
  const [charCount,setCharCount]=useState(0); //Number of characters entered
  const [processing,setProcessing]=useState(false); //Displays processing after the user clicks submit and till a response is recieved from backend
  const [missing,setMissing]=useState(false); //Displays a message when any field is not entered
  const [alreadyGiven,setAlreadygiven]=useState(false); //Displays a msg when user has already given a feedback before
  const [error,setError]=useState(false); //Dispalys msg of error when some error occurs from backend
  const charLimit=284; //Max number of characters allowed in message

  useEffect(()=>{ //Get email when component mounts 
    const emailValue=sessionStorage.getItem('user_email'); //Get the email from sessionStorage
    if(!emailValue) {
      console.log('Email is missing ! ');
      setMissing(true); //Display the message of missing fields
      setTimeout(()=>setMissing(false),1500); //Disable the msg after 1.5 seconds
      return;
    }
    setEmail(emailValue); //Set the email to the email in sessionStorage
  },[]);

  const handleMessageChange = (e) => { //Checks for length of message and sets the message
    const input = e.target.value;
    if (input.length <= charLimit) {
      setMessage(input);
      setCharCount(input.length);
    }
  };
  
  const submitFeedback=async(e)=>{ //Post the feedback to the backend
    e.preventDefault(); //Prevent page reload
    console.log("Inside submitFeedback ! ");
    if(!message||!name||rating===0||!email) {
      console.log('Some fields are missing ! ');
      setMissing(true); //Display the message of missing fields
      setTimeout(()=>setMissing(false),1500); //Disable the msg after 1.5 seconds
      return;
    }
    setProcessing(true); //Display processing
    try{
      console.log('About to post feedback ! ');
      const reqs=await fetch(`${backendLink}/postFeedback`,{
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          message,
          email,
          name,
          rating
        })
      });

      if(reqs.ok) { 
        setProcessing(false); //Hide the processing msg
        setSubmitted(true); //Show submitted msg
        setName(''); //Clear the input variables
        setRating(0);
        setMessage('');
        console.log('Feedback posted successfully ! ');
        setTimeout(()=>setSubmitted(false),1500); //Disable submitted msg after 1.5 seconds
      }
      else if(reqs.status===400) {
        setProcessing(false); //Hide the processing msg
        setAlreadygiven(true);
        console.log('You have already given a feedback before ! ');
        setTimeout(()=>setAlreadygiven(false),1500); //Disable already given msg after 1.5 seconds
      }
    }
    catch(err) {
      console.log('Some error occured ! ');
      setProcessing(false); //Hide the processing msg
      setError(true);
      setTimeout(()=>setError(false),1500); //Disable error msg after 1.5 seconds
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        🥭 We Value Your Feedback
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Tell us how your experience was with our store!
        </p>

        {/* Feedback Form */}
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Your Email"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
            value={email}
            readOnly
          />

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-medium">Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                {star <= rating ? "🥭" : "⭐"}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Write your feedback..."
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={message}
            onChange={handleMessageChange}
          />
          
            {charCount>=charLimit&&(
              <p className="text-sm text-right text-red-500">Character limit exceeded !</p>
            )}
          {/* Word Count */}
          <p className="text-sm text-right text-gray-500">{charCount}/{charLimit} characters</p>

          <button
            type="submit"
            onClick={(e) => submitFeedback(e)}
            disabled={processing}
            className={`w-full py-2 rounded-lg transition ${
              processing
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {processing ? "Submitting..." : "Submit Feedback"}
          </button>

          {processing && (
            <p className="text-gray-600 text-center mt-2">
              Processing...
            </p>
          )}
          {submitted && (
            <p className="text-green-500 text-center mt-2">
              Thank you for your feedback!
            </p>
          )}
          {alreadyGiven && (
            <p className="text-blue-500 text-center mt-2">
              You have already given a feedback before!
            </p>
          )}

          {missing && (
            <p className="text-red-500 text-center mt-2">
              Please fill out all the fields!
            </p>
          )}
          {error && (
            <p className="text-red-500 text-center mt-2">
              Some error occured!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;
