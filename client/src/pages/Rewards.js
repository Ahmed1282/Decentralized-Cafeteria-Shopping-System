import React, { useEffect, useState } from "react";
import Web3 from "web3";
import RewardLoyalty from "../contracts/RewardLoyalty.json";
import "./Rewards.css";

const Rewards = ({ accountIndex }) => {
  const [web3, setWeb3] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [conversionRate, setConversionRate] = useState(0); 
  const [rewardLoyaltyContract, setRewardLoyaltyContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initWeb3 = async () => {
      const web3Instance = new Web3(
        Web3.givenProvider || "http://localhost:7545"
      );
      setWeb3(web3Instance);

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = RewardLoyalty.networks[networkId];
      const rewardContract = new web3Instance.eth.Contract(
        RewardLoyalty.abi,
        deployedNetwork && deployedNetwork.address
      );
      setRewardLoyaltyContract(rewardContract);

      await fetchLoyaltyPoints(rewardContract, web3Instance);
    };

    initWeb3();
  }, []);

  const fetchLoyaltyPoints = async (rewardContract, web3Instance) => {
    try {
      const accounts = await web3Instance.eth.getAccounts();
      const account = accounts[accountIndex];
      const points = await rewardContract.methods
        .getLoyaltyPoints()
        .call({ from: account });

      const rate = await rewardContract.methods
        .getConversionRate()
        .call(); // Fetch conversion rate

      setLoyaltyPoints(points.toString());
      setConversionRate(parseInt(rate)); // Update conversion rate state
    } catch (error) {
      console.error("Error fetching loyalty points or conversion rate:", error);
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[accountIndex];

    if (parseInt(loyaltyPoints) < conversionRate) {
      console.error("Not enough loyalty points to redeem");
      window.alert("Not enough loyalty points to redeem.");
      return;
    }

    try {
      await rewardLoyaltyContract.methods
        .redeemPointsForTokens()
        .send({ from: account });
      await fetchLoyaltyPoints(rewardLoyaltyContract, web3);
    } catch (error) {
      console.error("Error redeeming points:", error);
    }
  };

  return (
    <div className="rewards-container">
      <h1>Rewards</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Account: {accountIndex}</p>
          <p>Loyalty Points: {loyaltyPoints}</p>
          <p>Conversion Rate: 1 FastCoin = {conversionRate} Points</p>
          <button onClick={redeemPoints}>
            Redeem Points
          </button>
        </>
      )}
    </div>
  );
};

export default Rewards;
