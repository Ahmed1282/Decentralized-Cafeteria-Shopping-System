// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MenuManagement {
    struct MenuItem {
        uint256 itemId;
        string name;
        uint256 price;
        uint256 availability;
        bool exists;
    }

    uint256 public itemCount;
    address public admin;

    // mapping to set staff addresses
    mapping(address => bool) public staffAddresses;

    // Array to store all of the items in the menu.
    MenuItem[] internal menuItems_array;

    // Addresses for other contracts for integration purposes.
    address orderProcessingContractAddress;

    event ItemAdded(
        uint256 indexed itemId,
        string name,
        uint256 price,
        uint256 availability
    );

    // Modifier to ensure the function is called by the integrated contracts only.
    modifier onlyIntegratedContracts() {
        require(
            msg.sender == orderProcessingContractAddress,
            "Only integrated contracts can call this function."
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    modifier onlyStaff() {
        require(
            staffAddresses[msg.sender] == true,
            "Only staff members can call this function."
        );
        _;
    }

    // Constructor updated to accept addresses of integrated contracts.
    constructor() {
        admin = msg.sender;
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
        orderProcessingContractAddress = _orderProcessingContractAddress;
    }

    // Function to add staff addresses
    function addStaff(address _staffAddress) public onlyAdmin {
        staffAddresses[_staffAddress] = true;
    }

    function removeStaff(address _staffAddress) public onlyAdmin {
        staffAddresses[_staffAddress] = false;
    }

    // Function to add a new item to the menu.
    function addItem(
        string memory name,
        uint256 price,
        uint256 availability
    ) public onlyStaff {
        require(availability > 0, "Invalid availability.");
        require(price > 0, "Invalid price.");

        itemCount++;

        // Add new item in the array
        menuItems_array.push(
            MenuItem(itemCount, name, price, availability, true)
        );

        // Emit event or notify other contracts as needed.
        emit ItemAdded(itemCount, name, price, availability);
    }

    // Function to update an existing menu item.
    function updateItem(
        uint256 itemId,
        string memory name,
        uint256 price,
        uint256 availability
    ) public onlyStaff {
        require(itemId <= itemCount && itemId > 0, "Item does not exist.");

        require(
            menuItems_array[itemId - 1].exists == true,
            "Item has been removed. It cannot be updated."
        );

        // Update the item in the array
        menuItems_array[itemId - 1] = MenuItem(
            itemId,
            name,
            price,
            availability,
            true
        );
        // Emit event or notify other contracts as needed.
    }

    // Function to remove an item from the menu.
    function removeItem(uint256 itemId) public onlyStaff {
        require(itemId <= itemCount && itemId > 0, "Item does not exist.");

        require(
            menuItems_array[itemId - 1].exists == true,
            "Item has been removed. It cannot be updated."
        );

        // Remove the item from the array
        menuItems_array[itemId - 1].exists = false;

        // Emit event or notify other contracts as needed.
    }

    // Function to check item availability (integration point for Order Processing Contract).
    function checkItemAvailability(
        uint256 itemId
    ) public view returns (uint256) {
        require(itemId <= itemCount && itemId > 0, "Item does not exist.");
        return menuItems_array[itemId - 1].availability;
    }

    function getItemPrice(uint256 itemId) public view returns (uint256) {
        require(itemId <= itemCount && itemId > 0, "Item does not exist.");
        return menuItems_array[itemId - 1].price;
    }

    // Function to get item details (itemId, name, price, availability).
    function getItemDetails(
        uint256 itemId
    ) public view returns (uint256, string memory, uint256, uint256) {
        require(itemId <= itemCount && itemId > 0, "Item does not exist.");
        MenuItem memory item = menuItems_array[itemId - 1];
        return (item.itemId, item.name, item.price, item.availability);
    }

    // Function to update item availability (called by Order Processing Contract after order completion).
    function reduceItemAvailability(
        uint256 itemId,
        uint256 unitsConsumed
    ) public onlyIntegratedContracts {
        require(itemId <= itemCount && itemId > 0, "Item does not exist.");
        require(
            menuItems_array[itemId - 1].availability >= unitsConsumed,
            "Cannot update item availability. Not enough units available to subtract."
        );
        menuItems_array[itemId - 1].availability -= unitsConsumed;
        // Emit event or notify other contracts as needed.
    }

    // Function to get all the items in the menu.
    function getMenuItems() external view returns (MenuItem[] memory) {
        uint256 count = 0;

        // Count the number of items in the menu.
        for (uint256 i = 0; i < menuItems_array.length; i++) {
            if (menuItems_array[i].exists) {
                count++;
            }
        }

        // Create a new array with the correct size.
        MenuItem[] memory tempItems = new MenuItem[](count);
        uint256 index = 0;

        // Add the items to the new array.
        for (uint256 i = 0; i < menuItems_array.length; i++) {
            if (menuItems_array[i].exists) {
                tempItems[index] = menuItems_array[i];
                index++;
            }
        }

        return tempItems;
    }
}
