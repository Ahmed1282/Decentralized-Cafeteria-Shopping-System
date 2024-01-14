import React from 'react';
import { Link } from 'react-router-dom';
import './OrderSummary.css'; // Make sure to create and import OrderSummary.css

function OrderSummary() {
  // Hardcoded order summary
  const orderDetails = {
    items: [
      { name: 'Pizza', quantity: 2, price: 20 },
      { name: 'Burger', quantity: 1, price: 5 }
    ],
    total: 25
  };

  return (
    <div className="order-summary-container">
      <h2>Order Summary</h2>
      {orderDetails.items.map((item, index) => (
        <div key={index} className="order-item">
          {item.quantity} x {item.name}: ${item.price}
        </div>
      ))}
      <div className="total">
        Total: ${orderDetails.total}
      </div>
      <Link to="/payment" className="payment-btn">Go to Payment</Link>
    </div>
  );
}

export default OrderSummary;
