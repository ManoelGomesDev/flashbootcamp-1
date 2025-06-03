// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {TaskManager} from "../src/TaskManager.sol";

contract TaskManagerTest is Test {
    TaskManager public taskManager;

    function setUp() public {
        taskManager = new TaskManager();
    }

    function testCreateTask() public {
        address owner = address(0xff);
        vm.label(owner, "OWNER");

        vm.prank(owner);
        vm.expectEmit();
        emit TaskManager.TaskCreated(0, "title", "description", block.timestamp, false, owner);
        taskManager.createTask("title", "description", block.timestamp);

        TaskManager.Task memory task = taskManager.getTasks(0);
        assertEq(task.title, "title");
        assertEq(task.description, "description");
        assertEq(task.dueDate, block.timestamp);
        assertEq(task.completed, false);
        assertEq(task.id, 0);
        assertEq(task.owner, owner);
    }

    function testCompleteTask() public {
        taskManager.createTask("title", "description", block.timestamp);
        taskManager.completeTask(0);
        assertEq(taskManager.getTasks(0).completed, true);
    }

    function testCompleteTaskRevertsIfNotOwner() public {
        taskManager.createTask("title", "description", block.timestamp);

        vm.prank(address(1));
        vm.expectRevert(TaskManager.Unauthorized.selector);
        // vm.expectRevert(0x82b429);
        taskManager.completeTask(0);
    }

    function testCompleteTaskRevertsIfAlreadyCompleted() public {
        taskManager.createTask("title", "description", block.timestamp);
        taskManager.completeTask(0);
        vm.expectRevert(TaskManager.AlreadyCompleted.selector);
        taskManager.completeTask(0);
    }


    function testCreateTaskFuzzy(address owner) public {
        vm.label(owner, "OWNER");

        vm.prank(owner);
        taskManager.createTask("title", "description", block.timestamp);

        TaskManager.Task memory task = taskManager.getTasks(0);

        assertEq(task.owner, owner);
    }
}
