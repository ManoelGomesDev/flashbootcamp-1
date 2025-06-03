// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// CRU-D
// CREATE createTask(...)
// READ   getTask(id)
// UPDATE completeTask(id)

// Task
// id
// title
// owner
// description
// completed
// createdAt
// dueDate
// completedAt

contract TaskManager {
    struct Task {
        uint256 completedAt;
        uint256 createdAt;
        uint256 dueDate;
        uint256 id;
        bool completed; // 1 byte
        address owner; // 20 bytes
        string title; // 11 bytes
        string description;
    }

    Task[] private tasks;

    // CRUD
    // CREATE createTask(...)
    function createTask(string memory _title, string memory _description, uint256 _dueDate) public {
        // Tipos primitivos
        // word = 32bytes
        // uint256 = 32bytes
        // uint256 idade = 300000000000000;
        // uint256 idade2 = 300000000000000;
        // uint8 altura = 255;
        //
        // [ idade ] -> 32 bytes
        // [ idade2 ] -> 32 bytes
        // [ altura, 0, 0, 0, 0, 132123 ] -> 31 bytes
        // [ 123120, 0, 0, 0, 0, 0, 0, 0, ...] -> 32 bytes
        // [0, 0, 0, 0, 0, 0, 0, 0, ...] -> 32 bytes
        // [0, 0, 0, 0, 0, 0, 0, 0, ...] -> 32 bytes
        // [0, 0, 0, 0, 0, 0, 0, 0, ...] -> 32 bytes
        // [0, 0, 0, 0, 0, 0, 0, 0, ...] -> 32 bytes
        // [0, 0, 0, 0, 0, 0, 0, 0, ...] -> 32 bytes
        // Tipos complexos
        // uint8[] alturas;

        Task memory task = Task({
            completedAt: 0,
            description: _description,
            createdAt: block.timestamp,
            dueDate: _dueDate,
            completed: false,
            owner: msg.sender,
            title: _title,
            id: tasks.length
        });

        tasks.push(task);

        emit TaskCreated(task.id, task.title, task.description, task.dueDate, task.completed, task.owner);
    }

    event TaskCreated(uint256 id, string title, string description, uint256 dueDate, bool completed, address owner);

    function getTasks(uint256 _id) public view returns (Task memory) {
        return tasks[_id];
    }

    // STORAGE Blockchain
    // [0, 1, 2, 3, 4, 255, 6, 7, 8, 9, 10]
    // MEMORY function
    // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    // funcSig 0x12345678
    error Unauthorized();
    // funcSig 0x66667112
    error AlreadyCompleted();

    function completeTask(uint256 _id) public {
        Task storage task = tasks[_id];

        if (task.owner != msg.sender) {
            revert Unauthorized();
        }
        if (task.completed == true) {
            revert AlreadyCompleted();
        }

        task.completed = true;
        task.completedAt = block.timestamp;
    }
}
