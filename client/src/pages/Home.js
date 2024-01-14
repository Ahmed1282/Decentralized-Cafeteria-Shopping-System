import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  // State to keep track of the current account index
  const [accountIndex, setAccountIndex] = useState(
    parseInt(localStorage.getItem('currentAccountIndex')) || 0
  );

  useEffect(() => {
    // Update localStorage whenever accountIndex changes
    localStorage.setItem('currentAccountIndex', accountIndex);
  }, [accountIndex]);

  const accounts = [0,1,2,3,4,5,6,7,8,9];

  // Function to cycle through accounts from account5 to account9
  const changeAccount = () => {
    setAccountIndex(prevIndex => {
      const nextIndex = prevIndex >= 9 ? 0 : prevIndex + 1;
      return nextIndex;
    });
  };

  return (
    <div className="homepage-container">
      <h1>Welcome to FAST Cafeteria</h1>
      <nav className="navigation">
        <Link to="/menu" className="nav-link">View Menu</Link>
        <Link to="/info" className="nav-link">Account Information</Link>
        <Link to="/rewards" className="nav-link">View Rewards</Link>
      </nav>
      <button onClick={changeAccount} className="change-account-button">Change Account</button>
      <p>Current Account: {accounts[accountIndex].toString()}</p>
    </div>
  );
}

export default Home;
