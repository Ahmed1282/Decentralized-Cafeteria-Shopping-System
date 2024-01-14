// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces.sol";
import "./order_processing.sol";

// Simple ERC20 Token Contract
contract FastCoin is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public _totalSupply;

    //admin's address
    address payable admin;

    // Conversion rate
    uint256 public conversionRate = 1e15 wei; // 1e15 Wei = 1 FastCoin, adjustable by admin.

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // Order Processing Contract
    OrderProcessing orderProcessingContract;

    // Reward Loyalty Contract
    address rewardsLoyaltyContractAddress;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can call this function.");
        _;
    }

    // Modifier to ensure the function is called by the integrated contracts only.
    modifier onlyIntegratedContracts() {
        require(
            msg.sender == rewardsLoyaltyContractAddress,
            "Only integrated contracts can call this function."
        );
        _;
    }

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        admin = payable(msg.sender);
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = (10 ** uint256(decimals));
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);

        _allowances[msg.sender][address(this)] = _totalSupply / 2;
        emit Approval(msg.sender, address(this), _totalSupply / 2);
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
        rewardsLoyaltyContractAddress = _rewardsLoyaltyContractAddress;
        // Update contract interfaces with the new addresses.
        orderProcessingContract = OrderProcessing(
            _orderProcessingContractAddress
        );
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(
        address account
    ) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(
        address _admin,
        address _spender
    ) public view override returns (uint256) {
        return _allowances[_admin][_spender];
    }

    function approve(
        address _spender,
        uint256 amount
    ) external override returns (bool) {
        _approve(msg.sender, _spender, amount);
        return true;
    }

    function transferFrom(
        address _sender,
        address _recipient,
        uint256 amount
    ) public override returns (bool) {
        require(
            _allowances[_sender][msg.sender] >= amount,
            "Insufficient allowance"
        );
        _transfer(_sender, _recipient, amount);
        _approve(
            _sender,
            msg.sender,
            _allowances[_sender][msg.sender] - amount
        );
        return true;
    }

    // Only for internal use, i.e., for this contract to call.
    function trustedTransferFrom(
        address _sender,
        address _recipient,
        uint256 amount
    ) internal {
        require(
            _allowances[_sender][address(this)] >= amount,
            "Insufficient allowance"
        );
        _transfer(_sender, _recipient, amount);
        _approve(
            _sender,
            address(this),
            _allowances[_sender][address(this)] - amount
        );
    }

    function processPayment(uint256 _orderId) external {
        uint256 totalPayment = orderProcessingContract.validateOrder(
            msg.sender,
            _orderId
        );
        require(totalPayment > 0, "Invalid order");
        _transfer(msg.sender, admin, totalPayment);
        orderProcessingContract.completeOrder(msg.sender, _orderId);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "Transfer from the zero address");
        require(recipient != address(0), "Transfer to the zero address");
        require(_balances[sender] >= amount, "Insufficient balance");

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(
        address _admin,
        address _spender,
        uint256 amount
    ) internal {
        require(_admin != address(0), "Approve from the zero address");
        require(_spender != address(0), "Approve to the zero address");

        _allowances[_admin][_spender] = amount;
        emit Approval(_admin, _spender, amount);
    }

    function redeemLoyaltyPoints(
        address user,
        uint256 tokensToTransfer
    ) external onlyIntegratedContracts {
        require(tokensToTransfer > 0, "Invalid number of tokens.");
        trustedTransferFrom(admin, user, tokensToTransfer);
    }

    receive() external payable {
        require(msg.value > 0, "Invalid amount");
        uint256 tokensToTransfer = msg.value / conversionRate;
        uint256 weiLeftOver = msg.value % conversionRate;
        // transferFrom(admin, msg.sender, tokensToTransfer);
        _transfer(admin, msg.sender, tokensToTransfer);
        payable(msg.sender).transfer(weiLeftOver);
        admin.transfer(msg.value - weiLeftOver);
    }

    // How many Wei is 1 FastCoin?
    function updateConversionRate(uint256 newRate) external {
        require(newRate > 0, "Conversion rate must be greater than zero.");
        conversionRate = newRate;
    }
}
