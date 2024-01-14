const MenuManagement = artifacts.require("MenuManagement");
const OrderProcessing = artifacts.require("OrderProcessing");
const PromotionDiscount = artifacts.require("PromotionDiscount");
const RewardLoyalty = artifacts.require("RewardLoyalty");
const FastCoin = artifacts.require("FastCoin");

module.exports = async function (deployer) {
    await deployer.deploy(PromotionDiscount);
    const promotionDiscountInstance = await PromotionDiscount.deployed();

    await deployer.deploy(MenuManagement);
    const menuManagementInstance = await MenuManagement.deployed();

    await deployer.deploy(OrderProcessing);
    const orderProcessingInstance = await OrderProcessing.deployed();

    await deployer.deploy(RewardLoyalty);
    const rewardLoyaltyInstance = await RewardLoyalty.deployed();

    await deployer.deploy(FastCoin, "FastCoin", "FC", 18);
    const FastCoinInstance = await FastCoin.deployed();

    // Call setIntegratedContracts function after deployment
    await Promise.all([
        menuManagementInstance.setIntegratedContracts(
            menuManagementInstance.address,
            FastCoinInstance.address,
            promotionDiscountInstance.address,
            rewardLoyaltyInstance.address,
            orderProcessingInstance.address
        ),
        orderProcessingInstance.setIntegratedContracts(
            menuManagementInstance.address,
            FastCoinInstance.address,
            promotionDiscountInstance.address,
            rewardLoyaltyInstance.address,
            orderProcessingInstance.address
        ),
        rewardLoyaltyInstance.setIntegratedContracts(
            menuManagementInstance.address,
            FastCoinInstance.address,
            promotionDiscountInstance.address,
            rewardLoyaltyInstance.address,
            orderProcessingInstance.address
        ),
        promotionDiscountInstance.setIntegratedContracts(
            menuManagementInstance.address,
            FastCoinInstance.address,
            promotionDiscountInstance.address,
            rewardLoyaltyInstance.address,
            orderProcessingInstance.address
        ),
        FastCoinInstance.setIntegratedContracts(
            menuManagementInstance.address,
            FastCoinInstance.address,
            promotionDiscountInstance.address,
            rewardLoyaltyInstance.address,
            orderProcessingInstance.address
        )
    ]);

    // Get all accounts
    const accounts = await web3.eth.getAccounts();

    // account[0] is the owner of the contract, account[1-3] are the staff addresses, account[4-9] are the customer addresses
    const staffAddresses = [accounts[1], accounts[2], accounts[3]];

    // Set the staff addresses in menuManagementInstance and promotionDiscountInstance
    for (let i = 0; i < staffAddresses.length; i++) {
        await Promise.all([
            menuManagementInstance.addStaff(staffAddresses[i]),
            promotionDiscountInstance.addStaff(staffAddresses[i]),
        ]);
    }
};
