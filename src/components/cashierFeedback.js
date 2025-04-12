import React, { useEffect, useState } from "react";

//NOTE : This is same as feedbacklist.js but made different file when viewed from cashier tab because no loggedIn feedback logic

function CashierFeedback() {
  const [feedbackList, setFeedbackList] = useState([]); //List of feedbacks
  const [loadedFeedbackCounts, setLoadedFeedbackCounts] = useState({});
  const [totalFeedbacks,setTotalFeedbacks]=useState([]); //Stores the total number of feedbacks per rating (logged in excluded)
  const [threshold,setThreshold]=useState(0); //Threshold which will be recieved from backend
  const [reverse,setReverse]=useState(false); //Will be kept on shown when all show mores are completed and we are clicking show less and each show less 
  //reduces the dispayed feedbacks by threshold amount (i.e going in reverse order) 

  //Logic for show less is to store the total number of feedbacks per rating each time show more is clicked , then in the end 
  //show less is clicked , if remainder of the total number and threshold is not 0 , then we remove the remainder amount of feedbacks
  //from the feedbacksList array , and if remainder is 0 , then threshold amount of feedbacks will be removed

  const [perShowmore,setPershowmore]=useState({}); //Stores total feedbacks per rating after all show mores

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feedbackRes = await fetch('http://localhost:5000/CfeedBacklist');
        const thresholdRes=await fetch('http://localhost:5000/thresholdValue');

        const feedbackData = await feedbackRes.json();
        const thresholdData=thresholdRes.ok ? await thresholdRes.json() : 0;
        setFeedbackList(Object.values(feedbackData));
        setThreshold(thresholdData);

      } catch (err) {
        console.log("Error in fetchData:", err);
      }

      const totalRequest=await fetch('http://localhost:5000/CtotalFeedbacks');
      if(totalRequest.ok) {
        const totalResponse=await totalRequest.json();
        setTotalFeedbacks(totalResponse);
      }
      else {
        setTotalFeedbacks([]);
      }
    };

    fetchData();
  }, []);

  useEffect(()=>{ //Will run when feedback list changes
    const temp={}; //Will store the current number of loaded feedbacks
    for(let i=1;i<=5;i++) {
      const group=feedbackList.find(g=>g.rating===i); //Gives the 1st match in array since data in this form [{rating:2,feedbacks:[]}]
        temp[i]={
          currentCount:group?group.feedbacks.length:0
      };
    }
    setLoadedFeedbackCounts(temp); 
  },[feedbackList]);

  const handleShowmore=async(rating)=>{ //When show more is clicked for a rating
    console.log('Total feedbacks array is ',totalFeedbacks);
    console.log('Current number of feedbacks is ',loadedFeedbackCounts[rating].currentCount,'and total is ',totalFeedbacks[rating-1]);
    console.log('Inside handleShowmore ! ');
    try{
      console.log('Inside try block of handleShowmore ! ');
      const num=loadedFeedbackCounts[rating].currentCount;  //Retrieve the current number of feedbacks displayed for the rating
      const reqs=await fetch(`http://localhost:5000/CshowMorefeedbacks?currentNum=${num}&rating=${rating}`);
      let lengthOfresponse=0; //Store length of array returned in response 

      if(reqs.ok) {
        const resp=await reqs.json();
        lengthOfresponse=resp.length;
        console.log('Fetched more successfully ! ');
        setLoadedFeedbackCounts((prev) => ({ //Increment the count of loaded feedbacks
          ...prev,
          [rating]: {
            currentCount: prev[rating].currentCount + lengthOfresponse
          }
        }));

        setFeedbackList((prev) => //Update feedback list
          prev.map((group) =>
            group.rating === rating
              ? { ...group, feedbacks: [...group.feedbacks, ...resp] }
              : group
          )
        );
        setPershowmore((prev) => ({ //Stores number of feedbacks after show more is called
          ...prev,
          [rating]: {
            count: (prev[rating]?.count || 0) + lengthOfresponse
          }
        }));
      }
      else {
        alert('No more feedbacks ! ');
      }
      
      if(num+lengthOfresponse===totalFeedbacks[rating-1]) { //Set reverse to true when all feedbacks are loaded
        setReverse(true);
      }

    }
    catch(err) {
      console.log('Inside catch block of handleShowmore ! ');
    }
  };

  const handleShowless=(rating)=>{ //Show less
  let amountToremove=0; //Number of feedbacks to remove

  //Lets add the logic of showing less (i.e mod one discussed above)
  const tempValue=loadedFeedbackCounts[rating].currentCount; //Store the value of current count before updating
  const count=perShowmore[rating].count; //retrive the count of feedbacks for the given rating after when show more was clciked
  const mod=count % threshold; //Stores the mod
  if(mod===0) {
    amountToremove=threshold;
    const tempArray = structuredClone(feedbackList);
    const updated = tempArray.map((group) => {
      if (group.rating === rating) {
       return {
        ...group,
        feedbacks: group.feedbacks.slice(0,-amountToremove) // Remove threshold amount of entries from end
      };
    }
      return group;
  });
  setFeedbackList(updated);
  setLoadedFeedbackCounts((prev) => ({
    ...prev,
    [rating]: {
      currentCount: prev[rating].currentCount-amountToremove
    }
  }));
  }
  else { //Mod is not 0
    amountToremove=mod;
    const tempArray = structuredClone(feedbackList);
    const updated = tempArray.map((group) => {
      if (group.rating === rating) {
       return {
        ...group,
        feedbacks: group.feedbacks.slice(0,-amountToremove) // Remove mod amount of entries from end
      };
    }
      return group;
  });
  setFeedbackList(updated);
  setLoadedFeedbackCounts((prev) => ({
    ...prev,
    [rating]: {
      currentCount: prev[rating].currentCount-mod
    }
  }));
  }
  if(tempValue-amountToremove===threshold) { //If threshold amount of feedbacks are displayed then show more will be displayed instead of show less
    setReverse(false); //No more reverse order , now show more will be displayed
    setPershowmore({}); //Clear perShowmore 
    return;
  }
  } 

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6">📋 Feedback Overview</h2>
  
      {feedbackList.length === 0 || (feedbackList.length === 1 && feedbackList[0].feedbacks.length === 0) ? (
        <p className="text-center text-gray-500">No feedbacks found.</p>
      ) : (
        feedbackList.map((group, index) =>
          group.feedbacks.length !== 0 ? (
            <div
              key={index}
              className="mb-6 border border-gray-300 rounded-lg p-4 shadow-md bg-white"
            >
              <h3 className="text-xl font-semibold text-yellow-600 mb-3">
                ⭐ {group.rating}-Star Feedbacks
              </h3>
  
              {group.feedbacks.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:mb-0"
                >
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-gray-600">{item.message}</p>
                </div>
              ))}
  
              {totalFeedbacks.length === 5 &&
                loadedFeedbackCounts[group.rating]?.currentCount < totalFeedbacks[group.rating - 1] && (
                  <button
                    onClick={() => handleShowmore(group.rating)}
                    className="py-2 px-6 bg-gray-800 text-white hover:bg-gray-500"
                  >
                    Show More
                  </button>
              )}

              {reverse &&loadedFeedbackCounts[group.rating]?.currentCount>5&& (
                  <button
                    onClick={() => handleShowless(group.rating)}
                    className="py-2 px-6 bg-gray-800 text-white hover:bg-gray-500"
                  >
                    Show Less
                  </button>
              )}
            </div>
          ) : null
        )
      )}
    </div>
  );
  
}

export default CashierFeedback;