// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./menu_management.sol";
import "./promotion_discount.sol";
import "./reward_loyalty.sol";
import "./payment_contract.sol";

contract OrderProcessing {
    struct Order {
        uint256 orderId;
        address user;
        uint256[] items;
        uint256[] quantities;
        uint256 totalAmount;
        bool completed;
        uint256 discountedAmount;
        uint256 grossAmount;
    }

    mapping(address => Order[]) public userOrders;
    uint256 public orderCount;

    address owner;

    // Interfaces for other contracts to interact with.
    MenuManagement menuManagementContract;
    FastCoin paymentContract;
    PromotionDiscount promotionsDiscountsContract;
    RewardLoyalty rewardsLoyaltyContract;

    // Addresses for other contracts for integration purposes.
    address menuManagementContractAddress;
    address payable paymentContractAddress;
    address promotionsDiscountsContractAddress;
    address rewardsLoyaltyContractAddress;

    event OrderPlaced(
        uint256 indexed orderId,
        address indexed user,
        uint256[] items,
        uint256[] quantities,
        uint256 totalAmount,
        uint256 discountedAmount,
        uint256 grossAmount
    );

    // Modifier to ensure the function is called by the integrated contracts only.
    modifier onlyIntegratedContracts() {
        require(
            msg.sender == menuManagementContractAddress ||
                msg.sender == paymentContractAddress ||
                msg.sender == promotionsDiscountsContractAddress ||
                msg.sender == rewardsLoyaltyContractAddress,
            "Only integrated contracts can call this function."
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner, "Only the admin can perform this action");
        _;
    }

    // Constructor updated to accept addresses of integrated contracts.
    constructor() {
        owner = msg.sender;
    }

    // Function to get all orders of a user
    function getAllOrders() external view returns (Order[] memory) {
        return userOrders[msg.sender];
    }

    // Function to update the addresses of integrated contracts, if needed.
    function setIntegratedContracts(
        address _menuManagementContractAddress,
        address payable _paymentContractAddress,
        address _promotionsDiscountsContractAddress,
        address _rewardsLoyaltyContractAddress,
        address _orderProcessingContractAddress
    ) public onlyAdmin {
        // Implement appropriate access control...
        menuManagementContractAddress = _menuManagementContractAddress;
        paymentContractAddress = _paymentContractAddress;
        promotionsDiscountsContractAddress = _promotionsDiscountsContractAddress;
        rewardsLoyaltyContractAddress = _rewardsLoyaltyContractAddress;
        // Update contract interfaces with the new addresses.
        menuManagementContract = MenuManagement(_menuManagementContractAddress);
        paymentContract = FastCoin(_paymentContractAddress);
        promotionsDiscountsContract = PromotionDiscount(
            _promotionsDiscountsContractAddress
        );
        rewardsLoyaltyContract = RewardLoyalty(_rewardsLoyaltyContractAddress);
    }

    function getOrderDetails(
        uint256 orderId
    )
        external
        view
        returns (
            address user,
            uint256[] memory itemIds,
            uint256[] memory quantities,
            uint256 totalAmount,
            bool completed,
            uint256 discountedAmount,
            uint256 grossAmount
        )
    {
        Order[] memory ordersByUser = userOrders[msg.sender];
        // Iterate through the orders placed by the user to find the order ID.
        for (uint256 i = 0; i < ordersByUser.length; i++) {
            if (ordersByUser[i].orderId == orderId) {
                return (
                    ordersByUser[i].user,
                    ordersByUser[i].items,
                    ordersByUser[i].quantities,
                    ordersByUser[i].totalAmount,
                    ordersByUser[i].completed,
                    ordersByUser[i].discountedAmount,
                    ordersByUser[i].grossAmount
                );
            }
        }
        require(false, "Order not found.");
    }

    // Function to place an order. This may involve checking item availability and applying promotions.
    // Returns the order ID and total amount payable.
    function placeOrder(
        uint256[] memory itemIds,
        uint256[] memory quantities
    ) external {
        uint256 totalAmount = 0;
        uint256 grossAmount = 0;
        uint256 discountedAmount = 0;

        // Iterate through the items in the order.
        for (uint256 i = 0; i < itemIds.length; i++) {
            // Check if the item is available in the menu.
            require(
                menuManagementContract.checkItemAvailability(itemIds[i]) >=
                    quantities[i],
                "Item not available in the required quantity."
            );
            // Calculate the total amount, considering any active promotions.

            // Get gross price of the item from the menuMangement contract.
            uint256 itemPrice = menuManagementContract.getItemPrice(itemIds[i]);
            // Get the discounted price of the item from the promotionsDiscounts contract.
            uint256 discountedPrice = promotionsDiscountsContract
                .calculateDiscountedPrice(itemIds[i], itemPrice);

            // Calculate the total amount for the item.
            totalAmount += discountedPrice * quantities[i];

            // Calculate the gross amount for the item.
            grossAmount += itemPrice * quantities[i];

            // Calculate the discounted amount for the item.
            discountedAmount += (itemPrice - discountedPrice) * quantities[i];
        }

        // Add the new order to the mapping of orders against user addresses.
        orderCount++;
        Order memory newOrder = Order(
            orderCount,
            msg.sender,
            itemIds,
            quantities,
            totalAmount,
            false,
            discountedAmount,
            grossAmount
        );
        userOrders[msg.sender].push(newOrder);
        emit OrderPlaced(
            orderCount,
            msg.sender,
            itemIds,
            quantities,
            totalAmount,
            discountedAmount,
            grossAmount
        );
    }

    // Function to validate an order before processing payment.
    // Called by the Payment Contract (Returns the total payable amount).
    function validateOrder(
        address user,
        uint256 _orderId
    ) public view onlyIntegratedContracts returns (uint256) {
        Order[] memory ordersByUser = userOrders[user];
        // Iterate through the orders placed by the user to find the order ID.
        for (uint256 i = 0; i < ordersByUser.length; i++) {
            if (ordersByUser[i].orderId == _orderId) {
                // Check if the order is completed.
                if (ordersByUser[i].completed) {
                    return 0;
                }
                // Check if the order is still valid (Enough items left in stock)
                for (uint256 j = 0; j < ordersByUser[i].items.length; j++) {
                    if (
                        menuManagementContract.checkItemAvailability(
                            ordersByUser[i].items[j]
                        ) < ordersByUser[i].quantities[j]
                    ) {
                        return 0;
                    }
                }
                return ordersByUser[i].totalAmount;
            }
        }
        return 0;
    }

    // Function to mark an order as completed.
    function completeOrder(
        address user,
        uint256 _orderId
    ) public onlyIntegratedContracts {
        Order[] storage ordersByUser = userOrders[user];
        // Iterate through the orders placed by the user to find the order ID.
        for (uint256 i = 0; i < ordersByUser.length; i++) {
            if (ordersByUser[i].orderId == _orderId) {
                ordersByUser[i].completed = true;
                // Reduce the item quantities from the menu.
                for (uint256 j = 0; j < ordersByUser[i].items.length; j++) {
                    menuManagementContract.reduceItemAvailability(
                        ordersByUser[i].items[j],
                        ordersByUser[i].quantities[j]
                    );
                }
                rewardsLoyaltyContract.successfulPurchaseMade(
                    user,
                    ordersByUser[i].totalAmount
                );
                return;
            }
        }
        require(false, "Order not found.");
    }
}