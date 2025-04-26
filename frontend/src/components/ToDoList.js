import React, { useState } from 'react';
import './ToDoList.css';

const ToDoList = () => {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState('');

    const handleTaskChange = (e) => {
        setTask(e.target.value);
    };

    const handleAddTask = () => {
        if (task) {
            setTasks([...tasks, task]);
            setTask('');
        }
    };

    const handleDeleteTask = (index) => {
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);
    };

    return (
        <div className="todo-container">
            <center><h2>To-Do List</h2></center>
            <div className="input-container">
                <input
                    type="text"
                    value={task}
                    onChange={handleTaskChange}
                    placeholder="Add a new task..."
                />
                <button onClick={handleAddTask}>Add Task</button>
            </div>
            <div className="task-list">
                <h3>Your Tasks:</h3>
                {tasks.length === 0 ? (
                    <p>No tasks yet.</p>
                ) : (
                    <ul>
                        {tasks.map((task, index) => (
                            <li key={index}>
                                {task}
                                <button onClick={() => handleDeleteTask(index)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ToDoList;
