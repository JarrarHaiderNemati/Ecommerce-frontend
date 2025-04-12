import { Navigate } from "react-router-dom"
import CashierDashboard from "./cashierDashboard";
import CustomerDashboard from "./customerDashboard";

function ProtectedRoute() {
  const email=sessionStorage.getItem('user_email'); //Retrieve email from session storage
  const role=sessionStorage.getItem('role'); //Retrieve role from session storage

  if(email&&role) {
    const currentPage=sessionStorage.getItem('currentPage'); //Get current page from session storage
    if(!currentPage) {
      return <Navigate to='/login'/> //Go back to login page if current page does not exist
    }
    if(currentPage==='login') { 
      if(role==='Customer') { //Go to customer page from login
        return <CustomerDashboard></CustomerDashboard>
      }
      else { //Go to cashier page from login
        return <CashierDashboard></CashierDashboard>
      }
    }
    else if(currentPage==='signup') { 
      if(role==='Customer') { //Go to customer page from signup
        return <CustomerDashboard></CustomerDashboard>
      }
      else { //Go to cashier dashbaord form signup
        return <CashierDashboard></CashierDashboard>
      }
    }
  }
  else {
    if(role==='Customer') {
      return <CustomerDashboard></CustomerDashboard>
    }
    else {
      return <CashierDashboard></CashierDashboard>
    }
  }
}
export default ProtectedRoute;