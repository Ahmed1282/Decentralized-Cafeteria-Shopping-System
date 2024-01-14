// test/payment_contract.js

const PaymentContract = artifacts.require("FastCoin");

module.exports = async function (deployer) {
    const paymentContractInstance = await PaymentContract.deployed();
    const accounts = await web3.eth.getAccounts();

    // sender are the accounts[4-8]
    const sender = [accounts[4], accounts[5], accounts[6], accounts[7], accounts[8]];

    // const initialBalance = await web3.eth.getBalance(paymentContractInstance.address);
    const valueToSend = web3.utils.toWei("10", "ether");

    // Send 10 ethers directly to the receive() function of PaymentContract
    for (let i = 0; i < sender.length; i++) {
        await web3.eth.sendTransaction({
            from: sender[i],
            to: paymentContractInstance.address,
            value: valueToSend
        });
    }
}
