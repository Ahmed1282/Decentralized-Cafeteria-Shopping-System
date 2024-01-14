import React, { useEffect, useState } from "react";
import Web3 from "web3";
import MenuManagement from "../contracts/MenuManagement.json";
import OrderProcessing from "../contracts/OrderProcessing.json";
import PromotionDiscount from "../contracts/PromotionDiscount.json";
import PaymentContractABI from "../contracts/FastCoin.json";

import "./Menu.css";

const Menu = ({ accountIndex }) => {
  const [web3, setWeb3] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  //order
  const [orderProcessingContract, setOrderProcessingContract] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  //promotion
  const [promotionDiscountInstance, setPromotionDiscountInstance] = useState(null);

  //payment
  const [paymentContract, setPaymentContract] = useState(null);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      const web3Instance = new Web3(
        Web3.givenProvider || "http://localhost:7545"
      );
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length === 0) {
        console.error("No accessible accounts!");
        return;
      }

      // Set the first account as the default account
      web3Instance.eth.defaultAccount = accounts[accountIndex];
      console.log("Using account:", accounts[accountIndex]);

      setWeb3(web3Instance);

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = MenuManagement.networks[networkId];
      const menuInstance = new web3Instance.eth.Contract(
        MenuManagement.abi,
        deployedNetwork && deployedNetwork.address
      );

      //order
      const orderDeployedNetwork = OrderProcessing.networks[networkId];
      const orderContract = new web3Instance.eth.Contract(
        OrderProcessing.abi,
        orderDeployedNetwork && orderDeployedNetwork.address
      );
      setOrderProcessingContract(orderContract);

      // Promotion discount contract setup
      const promotionDiscountData = PromotionDiscount.networks[networkId];
      if (promotionDiscountData) {
        const promoInstance = new web3Instance.eth.Contract(
          PromotionDiscount.abi,
          promotionDiscountData.address
        );
        setPromotionDiscountInstance(promoInstance);

        // Initialize Payment Contract
        const paymentDeployedNetwork = PaymentContractABI.networks[networkId];
        if (paymentDeployedNetwork) {
          const paymentInstance = new web3Instance.eth.Contract(
            PaymentContractABI.abi,
            paymentDeployedNetwork.address
          );
          setPaymentContract(paymentInstance);
        }

        const fetchedMenuItems = await menuInstance.methods
          .getMenuItems()
          .call();
        console.log(fetchedMenuItems.length);
        let items = [];

        for (let item of fetchedMenuItems) {
          let promoDetails = await promoInstance.methods
            .getPromotionDetails(item.itemId)
            .call();

          let description = String(promoDetails[1]); 
          let discountPercentage = Number(promoDetails[2]);
          //let validTillTimestamp = Number(promoDetails[3]);
          let validTill = Number(promoDetails[3]);
            // validTillTimestamp > 0
            //   ? new Date(validTillTimestamp * 1000).toLocaleString()
            //   : "N/A";

          items.push({
            id: Number(item.itemId),
            name: item.name,
            price: item.price.toString(),
            availability: Number(item.availability),
            discount: discountPercentage,
            validTill: validTill,
            description: description
          });
          console.log(item.itemId.toString(), item.availability.toString())
        }

         setMenuItems(items);
        // const itemCount = await menuInstance.methods.itemCount().call();
        // let items = [];
        // for (let i = 1; i <= itemCount; i++) {
        //   let item = await menuInstance.methods.getItemDetails(i).call();

        //   let discountDetails = await promoInstance.methods
        //     .getPromotionDetails(i)
        //     .call();

        //   // Convert BigInt values to string or number as needed
        //   let description = String(discountDetails[1]); 
        //   let discountPercentage = Number(discountDetails[2]); // Convert BigInt to Number
        //   let validTill = Number(discountDetails[3]);
        //   if (item[0] !== undefined){
        //   items.push({
        //     id: Number(item[0]), // Convert BigInt to Number
        //     name: item[1],
        //     price: item[2].toString(), //Convert to string
        //     availability: Number(item[3]), // Convert BigInt to Number
        //     discount: discountPercentage,
        //     validTill: validTill,
        //     description: description
        //   });
        // }
        // }
        // console.log(items.id,items.availability)
        // setMenuItems(items);
      } else {
        console.error(
          "PromotionDiscount contract not deployed to detected network."
        );
      }
    };

    initWeb3();
  }, []);

  const handleSelectItem = (item) => {
    if (isOrderPlaced) {
      alert("Order has been placed. You cannot select more items.");
      return;
    }
    if (item.availability > 0) {
      const existingItem = selectedItems.find(
        (selected) => selected.id === item.id
      );
      if (existingItem) {
        existingItem.quantity += 1; // Increase quantity if item is already selected
      } else {
        item.quantity = 1; // Set quantity to 1 for newly selected item
        setSelectedItems([...selectedItems, item]);
      }

      const updatedItems = menuItems.map((menuItem) => {
        if (menuItem.id === item.id) {
          menuItem.availability -= 1; // Decrease availability by 1
        }
        return menuItem;
      });

      setMenuItems(updatedItems);
    } else {
      alert("Item is not available");
    }
  };

  //order
  const placeOrder = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[accountIndex];
    const itemIds = selectedItems.map((item) => item.id);
    const quantities = selectedItems.map((item) => item.quantity);

    const gasLimit = await orderProcessingContract.methods
      .placeOrder(itemIds, quantities)
      .estimateGas({ from: account });

    // Place the order with increased gas
    const response = await orderProcessingContract.methods
      .placeOrder(itemIds, quantities)
      .send({ from: account, gas: gasLimit });
    const orderId = response.events.OrderPlaced.returnValues.orderId;
    console.log("Placing order with ID:", orderId);
    fetchOrderDetails(orderId);
    setIsOrderPlaced(true);
  };

  const fetchOrderDetails = async (orderId) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[accountIndex];
    const details = await orderProcessingContract.methods
      .getOrderDetails(orderId)
      .call({ from: account });

    // Convert the BigInts and arrays to a more usable format
    const formattedDetails = {
      orderId: orderId.toString(), // Make sure to set the orderId here
      user: details.user,
      itemIds: details.itemIds.map((id) => id.toString()), // Convert each BigInt to string
      quantities: details.quantities.map((quantity) => quantity.toString()), // Convert each BigInt to string
      totalAmount: details.totalAmount.toString(), // Convert BigInt to string
      discountedAmount: details.discountedAmount.toString(), // New line
      grossAmount: details.grossAmount.toString(), // New line
      itemNames: details.itemIds.map(
        (id) =>
          menuItems.find((item) => item.id === Number(id))?.name ||
          "Unknown Item"
      ),
    };

    console.log("Formatted order details:", formattedDetails);
    setOrderDetails(formattedDetails);
  };

  // Handle payment when the "Pay Now" button is clicked
  const handlePayment = async () => {
    if (!paymentContract || !orderDetails) {
      console.error("Contract or order details not loaded");
      return;
    }

    const accounts = await web3.eth.getAccounts();
    const account = accounts[accountIndex];

    try {
      const gasLimit = await paymentContract.methods
        .processPayment(orderDetails.orderId)
        .estimateGas({ from: account });
      await paymentContract.methods
        .processPayment(orderDetails.orderId)
        .send({ from: account, gas: gasLimit });
      console.log("Payment successful for order ID:", orderDetails.orderId);
      window.alert("Payment successful! Thank you for your order.");
      setIsPaymentCompleted(true); // Set payment completion status
      if(isPaymentCompleted == true){
        handleNewOrder();
      }
    } catch (error) {
      console.error("Payment failed:", error);
      window.alert("Payment Failed! Insufficent Funds.");
    }
  };

  const handleNewOrder = () => {
    window.location.reload(); // Reloads the current page
  };

  const handleRemoveItem = (itemId) => {
    const updatedSelectedItems = selectedItems.reduce((acc, item) => {
      if (item.id === itemId) {
        if (item.quantity > 1) {
          acc.push({ ...item, quantity: item.quantity - 1 });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

    setSelectedItems(updatedSelectedItems);

    // Update availability in menuItems
    const updatedMenuItems = menuItems.map((menuItem) => {
      if (menuItem.id === itemId) {
        return { ...menuItem, availability: menuItem.availability + 1 };
      }
      return menuItem;
    });

    setMenuItems(updatedMenuItems);
  };

  return (
    <div className="menu">
      <h1>Menu</h1>
      <h1>Account: {accountIndex}</h1>
      <button
        onClick={handleNewOrder}
        disabled={!isOrderPlaced || !isPaymentCompleted}
        className={
          !isOrderPlaced || !isPaymentCompleted ? "btn-disabled" : "btn-active"
        }
        style={{ position: "absolute", top: "20px", right: "20px" }}
      >
        New Order
      </button>
      {/* Displaying Menu Items */}
      <div className="menuItems">
        {menuItems.map((item, index) => (
          <div key={index} className="menuItem">
            <span>{item.name}</span> - <span>{item.price} FastCoins</span>
            <span>
              {" "}
              - Discount:{" "}
              {item.discount > 0 ? `${item.discount}%` : "No Discount"}
            </span>
            <span> ({item.description})</span>
            <span> (Valid Till: {item.validTill} Block)</span>
            <span> - Availability: {item.availability}</span>
            <button
              onClick={() => handleSelectItem(item)}
              disabled={item.availability <= 0 || isOrderPlaced}
              className={
                item.availability > 0 && !isOrderPlaced
                  ? "btn-disabled"
                  : "btn-active"
              }
            >
              Select
            </button>
          </div>
        ))}
      </div>

      {/* Displaying Selected Items */}
      <div className="selectedItems">
        <h2>Selected Items</h2>
        <ul>
          {selectedItems.map((item, index) => (
            <li key={index}>
              {item.name} - {item.price} FastCoins - x{item.quantity}
              <button
                onClick={() => handleRemoveItem(item.id)}
                disabled={isOrderPlaced}
                className={isOrderPlaced ? "btn-disabled" : "btn-active"}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Place Order Button */}
      <button
        onClick={placeOrder}
        disabled={isOrderPlaced || selectedItems.length === 0}
        className={
          isOrderPlaced || selectedItems.length === 0
            ? "btn-disabled"
            : "btn-active"
        }
      >
        Place Order
      </button>

      {/* Displaying Order Details */}
      {orderDetails && (
        <div className="orderDetails">
          <h2>Order Details</h2>
            <p>Order ID: {orderDetails.orderId || "Not Available"}</p>
            <p>Total Amount: {orderDetails.totalAmount || "Not Available"} FastCoins</p>
            <p>Discounted Amount: {orderDetails.discountedAmount || "Not Available"} FastCoins</p> {/* New line */}
            <p>Gross Amount: {orderDetails.grossAmount || "Not Available"} FastCoins</p> {/* New line */}
          <ul>
            {orderDetails.itemIds && orderDetails.itemIds.length > 0 ? (
              orderDetails.itemIds.map((id, index) => (
                <li key={id}>
                  Item: {orderDetails.itemNames[index]} - x
                  {orderDetails.quantities[index] || "Not Available"}
                </li>
              ))
            ) : (
              <p>No items in this order.</p>
            )}
          </ul>
          <button onClick={handlePayment} className="btn-active">
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
