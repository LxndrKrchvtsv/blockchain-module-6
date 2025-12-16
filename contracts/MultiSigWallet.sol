// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract MultiSigWallet {
    // --- EVENTS ---

    // Emitted when ETH is deposited into the wallet
    event Deposit(address indexed sender, uint256 amount, uint256 balance);

    // Emitted when a new transaction is submitted for approval
    event SubmitTransaction(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data);

    // Emitted when an owner confirms a transaction
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);

    // Emitted when an owner revokes their confirmation
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);

    // Emitted when a transaction is successfully executed
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    // --- STRUCTS ---

    struct Transaction {
        // The address to send funds or execute call on
        address to;
        // The amount of ETH (in wei) to send
        uint256 value;
        // The data payload (for calling functions on other contracts)
        bytes data;
        // Whether the transaction has been executed already
        bool executed;
        // The number of confirmations received so far
        uint256 numConfirmations;
    }

    // --- STATE VARIABLES ---

    // Array of owner addresses
    address[] public owners;

    // Mapping for O(1) access to check if an address is an owner
    mapping(address => bool) public isOwner;

    // The number of confirmations required to execute a transaction
    uint256 public numConfirmationsRequired;

    // Array storing all submitted transactions
    Transaction[] public transactions;

    // Mapping to track which owner confirmed which transaction
    // Mapping: transaction ID => owner address => bool
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    // --- MODIFIERS ---

    // Restricts access to only wallet owners
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    // Checks if the transaction exists
    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Tx does not exist");
        _;
    }

    // Checks if the transaction has not been executed yet
    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Tx already executed");
        _;
    }

    // Checks if the sender has not confirmed the transaction yet
    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Tx already confirmed");
        _;
    }

    // --- CONSTRUCTOR ---

    // Initializes the wallet with owners and the required confirmation threshold
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(
            _numConfirmationsRequired > 0 &&
            _numConfirmationsRequired <= _owners.length,
            "Invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    // --- FUNCTIONS ---

    // Function to receive ETH
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // Allows an owner to submit a new transaction
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        uint256 txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    // Allows an owner to confirm a pending transaction
    function confirmTransaction(uint256 _txIndex)
    public
    onlyOwner
    txExists(_txIndex)
    notExecuted(_txIndex)
    notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    // Allows an owner to execute a transaction if enough confirmations are collected
    function executeTransaction(uint256 _txIndex)
    public
    onlyOwner
    txExists(_txIndex)
    notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        // Check if the threshold is met
        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "Cannot execute tx"
        );

        // Mark as executed before the external call (reentrancy protection)
        transaction.executed = true;

        // Execute the transaction using low-level call
        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );

        require(success, "Tx failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    // Allows an owner to revoke their confirmation before execution
    function revokeConfirmation(uint256 _txIndex)
    public
    onlyOwner
    txExists(_txIndex)
    notExecuted(_txIndex)
    {
        require(isConfirmed[_txIndex][msg.sender], "Tx not confirmed");

        Transaction storage transaction = transactions[_txIndex];

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // --- GETTERS ---

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 _txIndex)
    public
    view
    returns (
        address to,
        uint256 value,
        bytes memory data,
        bool executed,
        uint256 numConfirmations
    )
    {
        Transaction storage transaction = transactions[_txIndex];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}