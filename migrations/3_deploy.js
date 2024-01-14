// test/payment_contract.js

const MenuManagementContract = artifacts.require("MenuManagement");
const PromotionDiscountContract = artifacts.require("PromotionDiscount");

module.exports = async function (deployer) {
    const menuManagementInstance = await MenuManagementContract.deployed();
    const promotionDiscountInstance = await PromotionDiscountContract.deployed();
    const accounts = await web3.eth.getAccounts();

    // Accounts 1-3 are staff accounts
    const staff = [accounts[1], accounts[2], accounts[3]];

    // Add menu items
    await menuManagementInstance.addItem("Chicken Rice", 150, 100, { from: staff[0] });
    await menuManagementInstance.addItem("Fish and Chips", 200, 120, { from: staff[0] });
    await menuManagementInstance.addItem("Beef Burger", 250, 150, { from: staff[0] });

    // Add promotions on menu items (id, description, discount percentage, valid till (block number))
    await promotionDiscountInstance.addPromotion(1, "20% OFF", 20, 50, { from: staff[1] });
    await promotionDiscountInstance.addPromotion(2, "30% OFF", 30, 30, { from: staff[1] });

    // Update promotions on menu items (id, description, discount percentage, valid till (block number))
    await promotionDiscountInstance.updatePromotion(1, "25% OFF", 25, 50, { from: staff[2] });

    // Delete promotions on menu items (id)
    await promotionDiscountInstance.deletePromotion(2, { from: staff[2] });
}
