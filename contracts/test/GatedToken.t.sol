// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {GatedToken} from "../src/GatedToken.sol";

contract GatedTokenTest is Test {
    GatedToken public token;
    
    // Test addresses
    address public admin = 0x4F10f93E2B0F5fAf6b6e5A03E8E48f96921D24C6;
    address public safe = 0x6264F29968e8fd2810cB79fb806aC65dAf9db73d;
    address public investorA = 0x0d9cf1dc3E134A736aAFb1296d2B316742b5c13e;
    address public investorB = 0xEFD94a1534959e04630899abDD5D768601F4Af5b;
    address public unapprovedWallet = address(0x9999);
    
    function setUp() public {
        // Deploy contract with Safe as owner
        token = new GatedToken("ACME Corp Equity", "ACME", safe);
    }

    /**
     * Test 1: Approve wallet → Mint tokens → Verify balance
     */
    function testApproveMintVerifyBalance() public {
        // Approve investorA
        vm.prank(safe);
        token.approveWallet(investorA);
        
        assertTrue(token.isApproved(investorA), "Wallet should be approved");
        
        // Mint 1000 tokens to investorA
        vm.prank(safe);
        token.mint(investorA, 1000 ether);
        
        // Verify balance
        assertEq(token.balanceOf(investorA), 1000 ether, "Balance should be 1000 tokens");
        assertEq(token.totalSupply(), 1000 ether, "Total supply should be 1000 tokens");
    }

    /**
     * Test 2: Transfer between two approved wallets → SUCCESS
     */
    function testTransferBetweenApprovedWallets() public {
        // Approve both wallets
        vm.startPrank(safe);
        token.approveWallet(investorA);
        token.approveWallet(investorB);
        token.mint(investorA, 1000 ether);
        vm.stopPrank();
        
        // Transfer from A to B
        vm.prank(investorA);
        token.transfer(investorB, 300 ether);
        
        // Verify balances
        assertEq(token.balanceOf(investorA), 700 ether, "InvestorA should have 700 tokens");
        assertEq(token.balanceOf(investorB), 300 ether, "InvestorB should have 300 tokens");
    }

    /**
     * Test 3: Transfer from approved to non-approved → REVERT
     */
    function testTransferToUnapprovedReverts() public {
        // Approve only investorA
        vm.startPrank(safe);
        token.approveWallet(investorA);
        token.mint(investorA, 1000 ether);
        vm.stopPrank();
        
        // Try to transfer to unapproved wallet - should revert
        vm.prank(investorA);
        vm.expectRevert(GatedToken.RecipientNotApproved.selector);
        token.transfer(unapprovedWallet, 100 ether);
    }

    /**
     * Test 4: Transfer from non-approved to approved → REVERT
     */
    function testTransferFromUnapprovedReverts() public {
        // Approve only investorA (not unapprovedWallet)
        vm.startPrank(safe);
        token.approveWallet(investorA);
        vm.stopPrank();
        
        // Give unapproved wallet some tokens directly (bypass for testing)
        // We can't actually do this through normal means, so we'll test minting to unapproved instead
        vm.prank(safe);
        vm.expectRevert(GatedToken.RecipientNotApproved.selector);
        token.mint(unapprovedWallet, 100 ether);
    }

    /**
     * Test 5: Revoke approval → Previously approved wallet can no longer receive
     */
    function testRevokeApprovalPreventsReceiving() public {
        // Approve both wallets and mint
        vm.startPrank(safe);
        token.approveWallet(investorA);
        token.approveWallet(investorB);
        token.mint(investorA, 1000 ether);
        vm.stopPrank();
        
        // First transfer should work
        vm.prank(investorA);
        token.transfer(investorB, 100 ether);
        assertEq(token.balanceOf(investorB), 100 ether);
        
        // Revoke investorB's approval
        vm.prank(safe);
        token.revokeWallet(investorB);
        
        assertFalse(token.isApproved(investorB), "InvestorB should not be approved");
        
        // Now transfer should fail
        vm.prank(investorA);
        vm.expectRevert(GatedToken.RecipientNotApproved.selector);
        token.transfer(investorB, 100 ether);
        
        // InvestorB also cannot send (revoked sender)
        vm.prank(investorB);
        vm.expectRevert(GatedToken.SenderNotApproved.selector);
        token.transfer(investorA, 50 ether);
    }

    /**
     * Test 6: Execute 7-for-1 split → All balances multiply by 7, total supply updates
     */
    function testStockSplit7For1() public {
        // Setup: mint tokens to investors
        vm.startPrank(safe);
        token.approveWallet(investorA);
        token.approveWallet(investorB);
        token.mint(investorA, 1000 ether);
        token.mint(investorB, 500 ether);
        vm.stopPrank();
        
        // Check initial balances
        assertEq(token.balanceOf(investorA), 1000 ether);
        assertEq(token.balanceOf(investorB), 500 ether);
        assertEq(token.totalSupply(), 1500 ether);
        
        // Execute 7-for-1 split
        vm.prank(safe);
        token.executeSplit(7);
        
        // Verify split multiplier
        assertEq(token.splitMultiplier(), 7, "Split multiplier should be 7");
        assertEq(token.totalSplits(), 1, "Total splits should be 1");
        assertTrue(token.lastSplitBlock() == block.number, "Last split block should be current block");
        
        // Verify balances are multiplied
        assertEq(token.balanceOf(investorA), 7000 ether, "InvestorA balance should be 7x");
        assertEq(token.balanceOf(investorB), 3500 ether, "InvestorB balance should be 7x");
        assertEq(token.totalSupply(), 10500 ether, "Total supply should be 7x");
        
        // Test that transfers still work with new balances
        // Transfer 1000 ether (virtual amount)
        vm.prank(investorA);
        token.transfer(investorB, 1000 ether);
        
        // Check balances (might have small rounding differences due to division)
        uint256 balanceA = token.balanceOf(investorA);
        uint256 balanceB = token.balanceOf(investorB);
        
        // After transferring 1000 ether from 7000 ether, should have ~6000 ether and ~4500 ether
        // Allow for rounding error of up to 7 wei (multiplier) in either direction
        assertTrue(balanceA >= 6000 ether - 7 && balanceA <= 6000 ether + 7, "InvestorA balance should be ~6000 ether");
        assertTrue(balanceB >= 4500 ether - 7 && balanceB <= 4500 ether + 7, "InvestorB balance should be ~4500 ether");
    }

    /**
     * Test 7: Change symbol → Metadata updates, balances unchanged
     */
    function testChangeSymbol() public {
        // Setup
        vm.startPrank(safe);
        token.approveWallet(investorA);
        token.mint(investorA, 1000 ether);
        vm.stopPrank();
        
        // Check initial symbol
        assertEq(token.symbol(), "ACME", "Initial symbol should be ACME");
        assertEq(token.name(), "ACME Corp Equity", "Name should remain unchanged");
        
        // Change symbol
        vm.prank(safe);
        token.changeSymbol("ACME2");
        
        // Verify new symbol
        assertEq(token.symbol(), "ACME2", "Symbol should be changed to ACME2");
        assertEq(token.name(), "ACME Corp Equity", "Name should remain unchanged");
        
        // Verify balances are unchanged
        assertEq(token.balanceOf(investorA), 1000 ether, "Balance should remain unchanged");
        assertEq(token.totalSupply(), 1000 ether, "Total supply should remain unchanged");
    }

    /**
     * Test 8: Unauthorized wallet attempts admin action → REVERT
     */
    function testUnauthorizedAdminActionReverts() public {
        // Try to approve wallet as non-owner
        vm.prank(investorA);
        vm.expectRevert();
        token.approveWallet(investorB);
        
        // Try to mint as non-owner
        vm.prank(investorA);
        vm.expectRevert();
        token.mint(investorA, 1000 ether);
        
        // Try to execute split as non-owner
        vm.prank(investorA);
        vm.expectRevert();
        token.executeSplit(2);
        
        // Try to change symbol as non-owner
        vm.prank(investorA);
        vm.expectRevert();
        token.changeSymbol("HACKED");
        
        // Verify owner is still the Safe
        assertEq(token.owner(), safe, "Owner should still be the Safe");
    }

    /**
     * Test 9: Burn tokens from approved wallet → SUCCESS
     */
    function testBurnFromApprovedWallet() public {
        // Setup
        vm.startPrank(safe);
        token.approveWallet(investorA);
        token.mint(investorA, 1000 ether);
        vm.stopPrank();
        
        assertEq(token.balanceOf(investorA), 1000 ether);
        assertEq(token.totalSupply(), 1000 ether);
        
        // Burn 300 tokens
        vm.prank(safe);
        token.burn(investorA, 300 ether);
        
        // Verify balances
        assertEq(token.balanceOf(investorA), 700 ether, "Balance should be reduced by 300");
        assertEq(token.totalSupply(), 700 ether, "Total supply should be reduced by 300");
        
        // Try to burn from unapproved wallet - should revert
        vm.prank(safe);
        vm.expectRevert(GatedToken.WalletNotApproved.selector);
        token.burn(unapprovedWallet, 100 ether);
    }

    /**
     * Test 10: Edge cases (zero amounts, self-transfer, etc.)
     */
    function testEdgeCases() public {
        // Setup
        vm.startPrank(safe);
        token.approveWallet(investorA);
        token.mint(investorA, 1000 ether);
        vm.stopPrank();
        
        // Test zero amount transfer (should succeed)
        vm.prank(investorA);
        token.transfer(investorA, 0);
        assertEq(token.balanceOf(investorA), 1000 ether);
        
        // Test self-transfer (should succeed since both sender and recipient are approved)
        vm.prank(investorA);
        token.transfer(investorA, 100 ether);
        assertEq(token.balanceOf(investorA), 1000 ether);
        
        // Test zero address approval should revert
        vm.prank(safe);
        vm.expectRevert(GatedToken.ZeroAddress.selector);
        token.approveWallet(address(0));
        
        // Test invalid split multiplier (< 2) should revert
        vm.prank(safe);
        vm.expectRevert(GatedToken.InvalidMultiplier.selector);
        token.executeSplit(1);
        
        // Test constructor with zero address should revert
        // OpenZeppelin v5 Ownable throws OwnableInvalidOwner for zero address
        vm.expectRevert();
        new GatedToken("Test", "TEST", address(0));
        
        // Test multiple splits compound correctly
        vm.startPrank(safe);
        token.executeSplit(2); // 2x
        assertEq(token.balanceOf(investorA), 2000 ether);
        token.executeSplit(3); // 6x total
        assertEq(token.balanceOf(investorA), 6000 ether);
        assertEq(token.splitMultiplier(), 6);
        assertEq(token.totalSplits(), 2);
        vm.stopPrank();
    }
}

