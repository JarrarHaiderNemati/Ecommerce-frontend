import './App.css';
import Login from './components/login';
import ProtectedRoute from './components/ProtectedRoute';
import CashierCart from './components/Cashiercart';
import Signup from './components/signup';
import Displayitems from './components/displayItems';
import Yourcart from './components/Yourcart';
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import Orderhistory from './components/OrderHistory';
import FeedbackForm from './components/feedback';
import FeedBackList from './components/feedbacklist';
import CashierFeedback from './components/cashierFeedback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to ='/login'/>}/>
        <Route path='/login' element={<Login></Login>}/>
        <Route path='/signup' element={<Signup></Signup>}/>
        <Route path="/casDashboard" element={<ProtectedRoute />} />
        <Route path="/shoppingCart" element={<CashierCart />}/>
        <Route path="/items" element={<Displayitems/>}/>
        <Route path="/yourCart" element={<Yourcart/>}/>
        <Route path="/orderhistory" element={<Orderhistory/>}/>
        <Route path="/feedback" element={<FeedbackForm/>}/>
        <Route path="/othersfeedback" element={<FeedBackList/>}/>
        <Route path="/cashierFeedback" element={<CashierFeedback/>}/>
      </Routes>
    </Router>
  );
}

export default App;
