import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './adminHome.css';

function AdminHome() {
  // State to keep track of the current account index
  const [staffIndex, staffAccountIndex] = useState(
    parseInt(localStorage.getItem('staffAccountIndex')) || 1
  );

  useEffect(() => {
    // Update localStorage whenever accountIndex changes
    localStorage.setItem('staffAccountIndex', staffIndex);
  }, [staffIndex]);

  // Only three accounts: 1, 2, and 3
  const accounts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Function to cycle through accounts 1 to 3
  const changeAccount = () => {
    staffAccountIndex(prevIndex => {
      const nextIndex = prevIndex >= 9 ? 0 : prevIndex + 1;
      return nextIndex;
    });
  };


  return (
    <div className="admin-homepage-container">
      <h1>Welcome to FAST Cafeteria - Staff Panel</h1>
      <nav className="navigation">
        <Link to="/adminMenu" className="nav-link">Add Menu</Link>
        <Link to="/promotionAndDiscounts" className="nav-link">Add Promotion & Discount</Link>
      </nav>
      <button onClick={changeAccount} className="change-account-button">Change Account</button>
      <p>Current Account: {accounts[staffIndex].toString()}</p>
    </div>
  );
}

export default AdminHome;
