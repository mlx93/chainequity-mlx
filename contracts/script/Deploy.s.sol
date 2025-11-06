// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {GatedToken} from "../src/GatedToken.sol";
import {console} from "forge-std/console.sol";

contract DeployGatedToken is Script {
    function run() external returns (GatedToken) {
        uint256 deployerPrivateKey = vm.envUint("ADMIN_PRIVATE_KEY");
        address adminAddress = vm.addr(deployerPrivateKey);
        
        console.log("Deploying GatedToken with the following parameters:");
        console.log("- Name: ACME Corp Equity");
        console.log("- Symbol: ACME");
        console.log("- Owner (Admin Address):", adminAddress);
        console.log("- Deployer:", adminAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        GatedToken token = new GatedToken(
            "ACME Corp Equity",
            "ACME",
            adminAddress
        );
        
        vm.stopBroadcast();
        
        console.log("\n========== DEPLOYMENT SUCCESSFUL ==========");
        console.log("Contract Address:", address(token));
        console.log("Transaction will be broadcast to Base Sepolia");
        console.log("Verify with:");
        console.log("forge verify-contract", address(token), "src/GatedToken.sol:GatedToken --chain-id 84532");
        console.log("==========================================\n");
        
        return token;
    }
}


