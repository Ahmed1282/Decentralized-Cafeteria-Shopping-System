import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Payment.css';

function Payment() {
  const amount = 25; // Hardcoded amount
  const navigate = useNavigate(); // Initialize useNavigate

  const handlePayment = () => {
    console.log('Payment with FastCoin');
    navigate('/rewards'); // Redirect to /rewards after payment
  };

  return (
    <div className="payment-container">
      <h3>Total Amount: ${amount}</h3>
      <button onClick={handlePayment} className="payment-btn">Pay with FastCoin</button>
    </div>
  );
}

export default Payment;
