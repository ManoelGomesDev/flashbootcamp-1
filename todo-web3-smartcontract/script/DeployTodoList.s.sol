// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/TodoList.sol";

contract DeployTodoList is Script {
    function run() public {
       
        vm.startBroadcast();
        
        TodoList todoList = new TodoList();
        
        console.log("TodoList deployed to:", address(todoList));
        
        vm.stopBroadcast();
    }
}