// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/TodoList.sol";

contract TodoListTest is Test {
    TodoList todoList;
    address owner = address(this);
    address user = address(0x1);

    function setUp() public {
        todoList = new TodoList();
    }

function testCreateTask() public {
        vm.deal(user, 1000000000000000000);
        vm.prank(user);
        todoList.createTask{value: 100000}("Tarefa 1", "Fazer algo", block.timestamp + 1 days, 0, false);
        assertEq(todoList.getTaskCount(), 1);
    }
function testCompleteTask() public {
        vm.deal(user, 1000000000000000000);
        vm.prank(user);
        todoList.createTask{value: 100000}("Tarefa 2", "Fazer outra coisa", block.timestamp + 1 days, 0, false);
        
        vm.prank(user);
        todoList.completeTask(0);
        (, , , , bool isCompleted,) = todoList.getTask(0);
        assertTrue(isCompleted);
    }

    function testFailCompleteTaskNotOwner() public {
        vm.deal(user, 1000000000000000000);
        vm.prank(user);
        todoList.createTask{value: 100000}("Tarefa 3", "Mais uma", block.timestamp + 1 days, 0, false);
        
        vm.prank(owner);
        todoList.completeTask(0);
    }

 
}