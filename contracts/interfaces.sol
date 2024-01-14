// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for ERC20 Token
interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

// interface IMenuManagementContract {
//     struct MenuItem {
//         uint256 itemId;
//         string name;
//         uint256 price;
//         uint256 availability;
//     }

//     function menuItems(uint256) external view returns (MenuItem memory);

//     function itemCount() external view returns (uint256);

//     function admin() external view returns (address);

//     function setIntegratedContracts(
//         address _orderProcessingContractAddress,
//         address payable _paymentContractAddress,
//         address _promotionsDiscountsContractAddress,
//         address _rewardsLoyaltyContractAddress
//     ) external;

//     function addItem(
//         string memory name,
//         uint256 price,
//         uint256 availability
//     ) external;

//     function updateItem(
//         uint256 itemId,
//         string memory name,
//         uint256 price,
//         uint256 availability
//     ) external;

//     function removeItem(uint256 itemId) external;

//     function checkItemAvailability(
//         uint256 itemId
//     ) external view returns (uint256);

//     function getItemPrice(uint256 itemId) external view returns (uint256);

//     // Function to get item details (itemId, name, price, availability).
//     function getItemDetails(
//         uint256 itemId
//     ) external view returns (uint256, string memory, uint256, uint256);

//     function reduceItemAvailability(
//         uint256 itemId,
//         uint256 unitsConsumed
//     ) external;

//     // Optional: function declaration for applyPromotion, if needed
//     // function applyPromotion(uint256 itemId, uint256 discountPercentage) external;
// }

// interface IOrderProcessingContract {
//     struct Order {
//         uint256 orderId;
//         address user;
//         uint256[] items;
//         uint256[] quantities;
//         uint256 totalAmount;
//         bool completed;
//     }

//     function userOrders(address) external view returns (Order[] memory);

//     function orderCount() external view returns (uint256);

//     function menuManagementContractAddress() external view returns (address);

//     function paymentContractAddress() external view returns (address);

//     function promotionsDiscountsContractAddress()
//         external
//         view
//         returns (address);

//     function rewardsLoyaltyContractAddress() external view returns (address);

//     function setIntegratedContracts(
//         address _menuManagementContractAddress,
//         address payable _paymentContractAddress,
//         address _promotionsDiscountsContractAddress,
//         address _rewardsLoyaltyContractAddress
//     ) external;

//     function placeOrder(
//         uint256[] memory itemIds,
//         uint256[] memory quantities
//     ) external returns (uint256, uint256);

//     function getOrderDetails(
//         uint256 orderId
//     )
//         external
//         view
//         returns (
//             address user,
//             uint256[] memory itemIds,
//             uint256[] memory quantities,
//             uint256 totalAmount
//         );

//     function validateOrder(
//         address user,
//         uint256 _orderId
//     ) external view returns (uint256);

//     function completeOrder(address user, uint256 _orderId) external;
// }

// interface IPromotionsDiscountsContract {
//     struct Promotion {
//         uint256 itemId; // ID of the menu item the promotion is for.
//         string description;
//         uint256 discountPercentage; // e.g., 10 for a 10% discount.
//         uint256 validTill; // Timestamp for when the promotion ends.
//     }

//     function itemPromotions(
//         uint256
//     ) external view returns (uint256, string memory, uint256, uint256);

//     function owner() external view returns (address);

//     function addPromotion(
//         uint256 _itemId,
//         string memory _description,
//         uint256 _discountPercentage,
//         uint256 _validTill
//     ) external;

//     function updatePromotion(
//         uint256 _itemId,
//         string memory _description,
//         uint256 _discountPercentage,
//         uint256 _validTill
//     ) external;

//     function removePromotion(uint256 _itemId) external;

//     function calculateDiscountedPrice(
//         uint256 _itemId,
//         uint256 itemPrice
//     ) external view returns (uint256);

//     function getPromotionDetails(
//         uint256 _itemId
//     ) external view returns (uint256, string memory, uint256, uint256);
// }

// interface IRewardsLoyaltyContract {
//     function fastCoinAddress() external view returns (address);

//     function loyaltyPoints(address) external view returns (uint256);

//     function conversionRate() external view returns (uint256);

//     function purchaseFactor() external view returns (uint256);

//     function setIntegratedContracts(
//         address _orderProcessingContractAddress,
//         address _menuManagementContractAddress,
//         address payable _paymentContractAddress,
//         address _promotionsDiscountsContractAddress
//     ) external;

//     function successfulPurchaseMade(address user, uint256 tokens) external;

//     function redeemPointsForTokens(address user, uint256 points) external;

//     function changeConversionRate(uint256 newRate) external;

//     event LoyaltyPointsAdded(address indexed user, uint256 points);
//     event LoyaltyPointsRedeemed(
//         address indexed user,
//         uint256 points,
//         uint256 tokens
//     );
//     event ConversionRateChanged(uint256 newRate);
// }
