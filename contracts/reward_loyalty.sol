// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./payment_contract.sol";

contract RewardLoyalty {
    // ERC20 token address for loyalty points (e.g., FastCoin).
    mapping(address => uint256) public loyaltyPoints;

    // Conversion rate for loyalty points to FastCoin tokens.
    uint256 public conversionRate = 100; // 100 points = 1 FastCoin, adjustable by admin.
    address public admin;

    // Percentage Factor to determine loyalty points based on purchase amount.
    // Percentage Factor = 10 means 1 loyalty point for every 10 FastCoin tokens spent on purchases.
    uint256 public purchaseFactor = 10;
    event LoyaltyPointsAdded(address indexed user, uint256 points);

    // Payment Contract
    FastCoin paymentContract;

    event LoyaltyPointsRedeemed(
        address indexed user,
        uint256 points,
        uint256 tokens
    );
    event ConversionRateChanged(uint256 newRate);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can call this function.");
        _;
    }

    // Function to get the current conversion rate
    function getConversionRate() external view returns (uint256) {
        return conversionRate;
    }

    // Get loyalty points for a user.
    function getLoyaltyPoints() external view returns (uint256) {
        return loyaltyPoints[msg.sender];
    }

    // Function to update the addresses of integrated contracts, if needed.
    function setIntegratedContracts(
        address _menuManagementContractAddress,
        address payable _paymentContractAddress,
        address _promotionsDiscountsContractAddress,
        address _rewardsLoyaltyContractAddress,
        address _orderProcessingContractAddress
    ) public onlyAdmin {
        // Update contract interfaces with the new addresses.
        paymentContract = FastCoin(_paymentContractAddress);
    }

    // Function to reward loyalty points based on a successful purchase made.
    function successfulPurchaseMade(address user, uint256 tokens) public {
        require(tokens > 0, "Invalid number of tokens.");

        // Calculate loyalty points based on the number of tokens received and scaling factor
        uint256 loyaltyPointsToAdd;
        if (tokens < 50) {
            loyaltyPointsToAdd = tokens / purchaseFactor; // Standard x factor
        } else if (tokens <= 100) {
            loyaltyPointsToAdd = (tokens * 125) / (purchaseFactor * 100); // 1.25x factor
        } else {
            loyaltyPointsToAdd = (tokens * 150) / (purchaseFactor * 100); // 1.5x factor
        }

        // Award loyalty points to the user
        loyaltyPoints[user] += loyaltyPointsToAdd;

        // Emit event indicating loyalty points added
        emit LoyaltyPointsAdded(user, loyaltyPointsToAdd);
    }

    // Function to redeem loyalty points for FastCoin tokens.
    function redeemPointsForTokens() public {
        address user = msg.sender;
        uint256 currentLoyaltyPoints = loyaltyPoints[user];
        require(
            currentLoyaltyPoints >= conversionRate,
            "Not enough loyalty points to redeem."
        );
        uint256 tokensToTransfer = currentLoyaltyPoints / conversionRate;
        uint256 pointsLeft = currentLoyaltyPoints % conversionRate;
        loyaltyPoints[user] -= (currentLoyaltyPoints - pointsLeft);
        // Call payment contract to transfer tokens to the user
        paymentContract.redeemLoyaltyPoints(user, tokensToTransfer);
        emit LoyaltyPointsRedeemed(
            user,
            currentLoyaltyPoints - pointsLeft,
            tokensToTransfer
        );
    }
}
