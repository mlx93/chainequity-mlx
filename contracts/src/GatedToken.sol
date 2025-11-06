// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GatedToken
 * @dev ERC-20 token with allowlist-based transfer restrictions and corporate action support
 * @notice Enforces compliance-gated transfers where both sender and recipient must be approved
 */
contract GatedToken is ERC20, Ownable {
    // Allowlist mapping: address => approved status
    mapping(address => bool) public allowlist;

    // Virtual split multiplier (starts at 1, multiply for splits)
    uint256 public splitMultiplier;

    // Mutable token metadata
    string private _tokenSymbol;
    string private _tokenName;

    // Corporate action tracking
    uint256 public totalSplits;
    uint256 public lastSplitBlock;

    // Events
    event WalletApproved(address indexed wallet, uint256 timestamp);
    event WalletRevoked(address indexed wallet, uint256 timestamp);
    event TokensMinted(address indexed to, uint256 amount, address indexed minter);
    event TokensBurned(address indexed from, uint256 amount, address indexed burner);
    event StockSplit(uint256 multiplier, uint256 newTotalSupply, uint256 timestamp);
    event SymbolChanged(string oldSymbol, string newSymbol, uint256 timestamp);

    // Custom errors for gas optimization
    error RecipientNotApproved();
    error SenderNotApproved();
    error WalletNotApproved();
    error InvalidMultiplier();
    error ZeroAddress();

    /**
     * @dev Constructor initializes the token with name, symbol, and Safe address as owner
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param safeAddress Address of the Gnosis Safe that will own the contract
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address safeAddress
    ) ERC20(name_, symbol_) Ownable(safeAddress) {
        if (safeAddress == address(0)) revert ZeroAddress();
        
        splitMultiplier = 1;
        _tokenName = name_;
        _tokenSymbol = symbol_;
    }

    /**
     * @dev Approve a wallet to send and receive tokens
     * @param wallet Address to approve
     */
    function approveWallet(address wallet) external onlyOwner {
        if (wallet == address(0)) revert ZeroAddress();
        allowlist[wallet] = true;
        emit WalletApproved(wallet, block.timestamp);
    }

    /**
     * @dev Revoke approval for a wallet
     * @param wallet Address to revoke
     */
    function revokeWallet(address wallet) external onlyOwner {
        allowlist[wallet] = false;
        emit WalletRevoked(wallet, block.timestamp);
    }

    /**
     * @dev Check if a wallet is approved
     * @param wallet Address to check
     * @return bool Approval status
     */
    function isApproved(address wallet) external view returns (bool) {
        return allowlist[wallet];
    }

    /**
     * @dev Mint tokens to an approved wallet
     * @param to Recipient address (must be approved)
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (!allowlist[to]) revert RecipientNotApproved();
        _mint(to, amount);
        emit TokensMinted(to, amount, msg.sender);
    }

    /**
     * @dev Burn tokens from an approved wallet
     * @param from Address to burn from (must be approved)
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        if (!allowlist[from]) revert WalletNotApproved();
        _burn(from, amount);
        emit TokensBurned(from, amount, msg.sender);
    }

    /**
     * @dev Execute a stock split (increases all balances virtually)
     * @param multiplier Split multiplier (must be >= 2, e.g., 7 for 7-for-1 split)
     */
    function executeSplit(uint256 multiplier) external onlyOwner {
        if (multiplier < 2) revert InvalidMultiplier();
        
        splitMultiplier *= multiplier;
        totalSplits++;
        lastSplitBlock = block.number;
        
        emit StockSplit(multiplier, totalSupply(), block.timestamp);
    }

    /**
     * @dev Change the token symbol (for corporate rebranding)
     * @param newSymbol New token symbol
     */
    function changeSymbol(string memory newSymbol) external onlyOwner {
        string memory oldSymbol = _tokenSymbol;
        _tokenSymbol = newSymbol;
        emit SymbolChanged(oldSymbol, newSymbol, block.timestamp);
    }

    /**
     * @dev Override symbol() to return mutable symbol
     * @return string Current token symbol
     */
    function symbol() public view override returns (string memory) {
        return _tokenSymbol;
    }

    /**
     * @dev Override name() to return mutable name
     * @return string Current token name
     */
    function name() public view override returns (string memory) {
        return _tokenName;
    }

    /**
     * @dev Override balanceOf to apply virtual split multiplier
     * @param account Address to check balance
     * @return uint256 Balance with split multiplier applied
     */
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account) * splitMultiplier;
    }

    /**
     * @dev Override totalSupply to apply virtual split multiplier
     * @return uint256 Total supply with split multiplier applied
     */
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply() * splitMultiplier;
    }

    /**
     * @dev Override _update to enforce allowlist restrictions and handle virtual splits
     * @param from Sender address (must be approved, except for minting)
     * @param to Recipient address (must be approved, except for burning)
     * @param amount Amount to transfer (in virtual split terms)
     */
    function _update(address from, address to, uint256 amount) internal virtual override {
        // Allow minting (from == address(0))
        if (from != address(0)) {
            if (!allowlist[from]) revert SenderNotApproved();
        }
        
        // Allow burning (to == address(0))
        // Always check recipient for non-burn operations
        if (to != address(0)) {
            if (!allowlist[to]) revert RecipientNotApproved();
        }
        
        // Adjust amount for virtual split - divide by multiplier to get base amount
        uint256 baseAmount = amount / splitMultiplier;
        
        super._update(from, to, baseAmount);
    }
}

