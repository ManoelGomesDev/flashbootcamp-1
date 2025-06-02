// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Task {
        string title;
        string description;
        uint dueDate;
        uint priority;
        bool isCompleted;
        address owner;
    }

    Task[] public tasks;

    mapping(uint => uint) public taskToAmount;

    uint[4] public priorityLevels = [
        100 wei,    // Alta
        50 wei,     // Media
        25 wei,     // Baixa
        10 wei      // Muito baixa
        ];

    event TaskCreated(
        uint taskId,
        string title, 
        string description, 
        uint dueDate, 
        uint priority, 
        bool isCompleted, 
        address owner
        );
    event TaskCompleted(
        uint taskId,
        address owner,
        uint amount
        );
  

    function createTask(
        string memory _title, 
        string memory _description, 
        uint _dueDate, 
        uint _priority, 
        bool _isCompleted
        ) public payable {
        require(_dueDate > block.timestamp, "Due date must be in the future");
        require(_priority < 4, "Invalid priority");

        uint amount = priorityLevels[_priority];

        require(msg.value == amount, "Invalid payment amount");

        uint taskId = tasks.length;
        taskToAmount[taskId] = amount;
        tasks.push(Task(_title, _description, _dueDate, _priority, _isCompleted, msg.sender));

        emit TaskCreated(taskId, _title, _description, _dueDate, _priority, _isCompleted, msg.sender);
    }

    function completeTask(uint _taskId) public {
        require(_taskId < tasks.length, "Invalid task ID");
        require(!tasks[_taskId].isCompleted, "Task already completed");
        require(block.timestamp <= tasks[_taskId].dueDate, "Task has expired");
        require(tasks[_taskId].owner == msg.sender, "You are not the owner of this task");

        tasks[_taskId].isCompleted = true;

        uint amount = taskToAmount[_taskId];
        
        address payable owner = payable(tasks[_taskId].owner);
        owner.transfer(amount);

        emit TaskCompleted(_taskId, owner, taskToAmount[_taskId]);
    }

    function getTask(uint _taskId) public view returns (string memory, string memory, uint, uint, bool, address) {
        return (
            tasks[_taskId].title, 
            tasks[_taskId].description, 
            tasks[_taskId].dueDate, 
            tasks[_taskId].priority, 
            tasks[_taskId].isCompleted, 
            tasks[_taskId].owner)
            ;
    }

    function getTaskCount() public view returns (uint) {
        return tasks.length;
    }
    
    
}