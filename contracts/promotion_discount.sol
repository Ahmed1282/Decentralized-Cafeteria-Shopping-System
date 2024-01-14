// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PromotionDiscount {
    struct Promotion {
        uint256 itemId; // ID of the menu item the promotion is for.
        string description;
        uint256 discountPercentage; // e.g., 10 for a 10% discount.
        uint256 validTill; // Holds the block number till which the promotion is valid.
    }

    // Array to store all of the promotions in the contract.
    Promotion[] internal promotions;

    // Mapping to store promotions for each item
    mapping(uint256 => Promotion) public itemPromotions;

    // Mapping to set staff addresses
    mapping(address => bool) public staffAddresses;

    // Admin address
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can call this function.");
        _;
    }

    modifier onlyStaff() {
        require(
            staffAddresses[msg.sender] == true,
            "Only staff members can call this function."
        );
        _;
    }

    // Function to update the addresses of integrated contracts, if needed.
    function setIntegratedContracts(
        address _menuManagementContractAddress,
        address payable _paymentContractAddress,
        address _promotionsDiscountsContractAddress,
        address _rewardsLoyaltyContractAddress,
        address _orderProcessingContractAddress
    ) public onlyAdmin {}

    // Function to add a new promotion for a specific item.
    function addPromotion(
        uint256 _itemId,
        string memory _description,
        uint256 _discountPercentage,
        uint256 _validTill
    ) public onlyStaff {
        require(
            _validTill > block.number,
            "Promotion end time must be in the future."
        );
        require(
            _discountPercentage > 0 && _discountPercentage <= 100,
            "Invalid discount percentage."
        );

        // Check that the promotion does not exist for the item.
        require(
            itemPromotions[_itemId].validTill == 0,
            "Promotion already exists for this item."
        );

        // Set the promotion for the item.
        itemPromotions[_itemId] = Promotion(
            _itemId,
            _description,
            _discountPercentage,
            _validTill
        );

        // Add the promotion to the array of promotions.
        promotions.push(
            Promotion(_itemId, _description, _discountPercentage, _validTill)
        );

        // Emit event or notify other contracts as needed.
    }

    // Function to add staff addresses
    function addStaff(address _staffAddress) external onlyAdmin {
        staffAddresses[_staffAddress] = true;
    }

    // Function to remove staff addresses
    function removeStaff(address _staffAddress) public onlyAdmin {
        staffAddresses[_staffAddress] = false;
    }

    // Function to update an existing promotion for a specific item.
    function updatePromotion(
        uint256 _itemId,
        string memory _description,
        uint256 _discountPercentage,
        uint256 _validTill
    ) public onlyStaff {
        require(
            _validTill > block.number,
            "Promotion end time must be in the future."
        );
        require(
            _discountPercentage > 0 && _discountPercentage <= 100,
            "Invalid discount percentage."
        );

        // Check that the promotion exists for the item.
        require(
            itemPromotions[_itemId].validTill > 0,
            "Promotion does not exist for this item."
        );

        itemPromotions[_itemId] = Promotion(
            _itemId,
            _description,
            _discountPercentage,
            _validTill
        );

        // Update the promotion in the promotions array.
        for (uint256 i = 0; i < promotions.length; i++) {
            if (promotions[i].itemId == _itemId) {
                promotions[i].description = _description;
                promotions[i].discountPercentage = _discountPercentage;
                promotions[i].validTill = _validTill;
                break;
            }
        }
        // Emit event or notify other contracts as needed.
    }

    // Function to update an existing promotion for a specific item.
    function deletePromotion(uint256 _itemId) public onlyStaff {
        // Check that the promotion exists for the item.
        require(
            itemPromotions[_itemId].validTill > 0,
            "Promotion does not exist for this item."
        );

        // Delete the promotion for the item.
        itemPromotions[_itemId].validTill = 0;

        // Update the promotion in the promotions array.
        for (uint256 i = 0; i < promotions.length; i++) {
            if (promotions[i].itemId == _itemId) {
                promotions[i].validTill = 0;
                break;
            }
        }
        // Emit event or notify other contracts as needed.
    }

    // Function to calculate the discounted price for an item.
    function calculateDiscountedPrice(
        uint256 _itemId,
        uint256 itemPrice
    ) public view returns (uint256) {
        uint256 discountedPrice = itemPrice;
        if (itemPromotions[_itemId].validTill > block.number) {
            // Apply the promotion if it's still valid.
            discountedPrice =
                itemPrice -
                ((itemPrice * itemPromotions[_itemId].discountPercentage) /
                    100);
        }
        return discountedPrice;
    }

    // Function to check if there is a promotion for a specific item and return its details if available.
    function getPromotionDetails(
        uint256 _itemId
    ) public view returns (uint256, string memory, uint256, uint256) {
        if (itemPromotions[_itemId].validTill > block.number) {
            // Promotion exists for this item, return its details.
            return (
                _itemId,
                itemPromotions[_itemId].description,
                itemPromotions[_itemId].discountPercentage,
                itemPromotions[_itemId].validTill
            );
        } else {
            // No promotion exists for this item, return specific values to indicate absence of promotion.
            return (0, "", 0, 0);
        }
    }

    // Get all the promotions in the contract
    function getAllPromotions()
        external
        view
        onlyStaff
        returns (Promotion[] memory)
    {
        return promotions;
    }
}
