import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Info from './pages/Info';
import Payment from './pages/Payment';
import OrderSummary from './pages/OrderSummary';
import Rewards from './pages/Rewards';
import AdminMenu from './staff/adminMenu';
import PromotionAndDiscounts from './staff/promotionAndDiscounts';
import AdminHome from './staff/adminHome';


function App() {
  // Get the accountIndex from localStorage or set it to 5 if not found
  const accountIndex = parseInt(localStorage.getItem('currentAccountIndex')) || 0;
  const staffIndex = parseInt(localStorage.getItem('staffAccountIndex')) || 0;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu" element={<Menu accountIndex={accountIndex} />} />
        <Route path="/info" element={<Info accountIndex={accountIndex} />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/rewards" element={<Rewards accountIndex={accountIndex} />} />

        {/* routes from Staff Pages*/}
        <Route path="/staffHome" element={<AdminHome />} />
        <Route path="/adminMenu" element={<AdminMenu  staffIndex={staffIndex}/>} />
        <Route path="/promotionAndDiscounts" element={<PromotionAndDiscounts staffIndex={staffIndex} />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
