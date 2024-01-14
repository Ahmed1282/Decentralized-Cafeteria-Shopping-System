import React, { useEffect, useState } from "react";
import Web3 from "web3";
import OrderProcessing from "../contracts/OrderProcessing.json";
import MenuManagement from "../contracts/MenuManagement.json";
import PaymentContract from "../contracts/FastCoin.json";
import "./Info.css";

const Info = ({ accountIndex }) => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [fastCoins, setFastCoins] = useState(0);
  const [etherBalance, setEtherBalance] = useState(0);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3(
          Web3.givenProvider || "http://localhost:7545"
        );
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length === 0) {
          console.error("No accessible accounts!");
          return;
        }

        web3Instance.eth.defaultAccount = accounts[accountIndex];
        console.log("Using account:", accounts[accountIndex]);

        const networkId = await web3Instance.eth.net.getId();
        console.log('Current Account Index:', accountIndex);

        // Initialize contracts
        const orderContract = initializeContract(
          web3Instance,
          OrderProcessing,
          networkId
        );
        const menuContract = initializeContract(
          web3Instance,
          MenuManagement,
          networkId
        );
        const paymentContract = initializeContract(
          web3Instance,
          PaymentContract,
          networkId
        );

        await fetchMenuItems(menuContract);
        await fetchAllOrders(orderContract, web3Instance);
        await fetchUserBalance(paymentContract, accounts[accountIndex], web3Instance);
      } catch (error) {
        console.error("Error initializing web3:", error);
      }
    };

    initWeb3();
  }, []);

  const initializeContract = (web3Instance, contractJSON, networkId) => {
    const deployedNetwork = contractJSON.networks[networkId];
    return new web3Instance.eth.Contract(
      contractJSON.abi,
      deployedNetwork && deployedNetwork.address
    );
  };

  const fetchMenuItems = async (menuContract) => {
    try {
      const itemsArray = await menuContract.methods.getMenuItems().call();
      let items = {};
      itemsArray.forEach((item) => {
        if (item.exists) { // Check if the item exists
          items[item.itemId] = {
            itemId: item.itemId,
            name: item.name,
            price: item.price,
          };
        }
      });
    setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchAllOrders = async (orderContract, web3Instance) => {
    try {
      const accounts = await web3Instance.eth.getAccounts();
      if (!accounts || accounts.length === 0) {
        console.error("No accounts found.");
        return;
      }

      // Fetch all orders for the first account
      const userOrders = await orderContract.methods
        .getAllOrders()
        .call({ from: accounts[accountIndex] });
      console.log("User Orders:", userOrders);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
    }
  };

  const fetchUserBalance = async (paymentContract, account, web3Instance) => {
    try {
      const fastCoinBalance = await paymentContract.methods
        .balanceOf(account)
        .call();
      const ether = await web3Instance.eth.getBalance(account);

      setFastCoins(fastCoinBalance);
      setEtherBalance(web3Instance.utils.fromWei(ether, "ether"));
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

  return (
    <div className="account-container">
      <h1>Your Account</h1>
      <div className="balance-info">
        <p>Account: {accountIndex}</p>
        <p>FastCoins: {fastCoins.toString()} FastCoins</p>
        <p>Ether: {etherBalance}</p>
      </div>
      <h2>Past Orders</h2>
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No past orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div key={index} className="order">
              <h3>Order ID: {order.orderId.toString()}</h3>
              <p>Total Amount: {order.totalAmount.toString()} FastCoins</p>
              <p>Discounted Amount: {order.discountedAmount.toString() || "Not Available"} FastCoins</p> {/* New line */}
              <p>Gross Amount: {order.grossAmount.toString() || "Not Available"} FastCoins</p> {/* New line */}
              <p>Status: {order.completed ? "Completed" : "Pending"}</p>
              <div className="order-items">
                {order.items.map((itemId, idx) => (
                  <div key={idx} className="order-item">
                    <p>Item: {menuItems[itemId]?.name || "Unknown"}</p>
                    <p>Price: {menuItems[itemId]?.price.toString() || "Unknown"} FastCoins</p>
                    <p>Quantity: {order.quantities[idx].toString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Info;
