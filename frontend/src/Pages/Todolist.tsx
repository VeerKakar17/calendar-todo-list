import React, { useEffect } from 'react';
import {useState} from 'react'
import {APIError, fetchData} from '../App'
import { Navigate, useNavigate } from 'react-router-dom';

interface Task {
    id: number,
    text: string,
    is_completed: boolean,
    due_date: string | null,
    task_type: string | null,
    task_class: string | null,
}

export function Todolist() {
    const [tasks, setTasks] = useState<Task[]>([])
    const navigate = useNavigate();

    useEffect(() => {
        fetchData<Task[]>('/tasks', 'GET').then((response: Task[]) => {
            setTasks(response);
            console.log("tasks set");
        }).catch((e: APIError) => {
            console.log("Error getting tasks: " + e.statusCode + " " + e.message);
            if (e.statusCode === 401) {
                navigate("/login")
            }
        }).catch((e: Error) => {
            console.log("Error getting tasks: " + e.message);
        });
    }, []);

    const formatDueDate = (dueDate: string | null) => {
        if (!dueDate) return "No due date";
        return new Date(dueDate).toLocaleDateString();
    };

    const getPriorityClass = (taskClass: string | null) => {
        switch (taskClass) {
            case 'urgent': return 'priority-urgent';
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return 'priority-default';
        }
    };


    return (
        <div className="tasks-container">
             <div className="simple-list">
                <h2>My Tasks ({tasks.length})</h2>
                {tasks.length === 0 ? (
                    <p>No tasks found. Create your first task!</p>
                ) : (
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id} className={task.is_completed ? 'completed' : 'pending'}>
                                <span className={task.is_completed ? 'task-text completed' : 'task-text'}>
                                    {task.text}
                                </span>
                                {task.due_date && (
                                    <span className="due-date">Due: {formatDueDate(task.due_date)}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* OPTION 2: Card layout with more details */}
            <div className="card-layout">
                <h2>Task Cards</h2>
                <div className="tasks-grid">
                    {tasks.map((task) => (
                        <div key={task.id} className={`task-card ${task.is_completed ? 'completed' : 'active'} ${getPriorityClass(task.task_class)}`}>
                            <div className="task-header">
                                <h3 className={task.is_completed ? 'completed-text' : ''}>{task.text}</h3>
                                <span className={`status ${task.is_completed ? 'done' : 'pending'}`}>
                                    {task.is_completed ? '✅' : '⏳'}
                                </span>
                            </div>
                            
                            <div className="task-details">
                                {task.due_date && (
                                    <p className="due-date">📅 {formatDueDate(task.due_date)}</p>
                                )}
                                {task.task_type && (
                                    <p className="task-type">🏷️ {task.task_type}</p>
                                )}
                                {task.task_class && (
                                    <span className={`priority-badge ${getPriorityClass(task.task_class)}`}>
                                        {task.task_class}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* OPTION 3: Separated by completion status */}
            <div className="separated-layout">
                <div className="incomplete-tasks">
                    <h3>Pending Tasks ({tasks.filter(t => !t.is_completed).length})</h3>
                    {tasks
                        .filter(task => !task.is_completed)
                        .map(task => (
                            <div key={task.id} className="task-item pending-task">
                                <div className="task-content">
                                    <h4>{task.text}</h4>
                                    {task.due_date && <p>Due: {formatDueDate(task.due_date)}</p>}
                                    <div className="task-meta">
                                        {task.task_type && <span className="type-tag">{task.task_type}</span>}
                                        {task.task_class && <span className={`priority-tag ${getPriorityClass(task.task_class)}`}>{task.task_class}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                <div className="completed-tasks">
                    <h3>Completed Tasks ({tasks.filter(t => t.is_completed).length})</h3>
                    {tasks
                        .filter(task => task.is_completed)
                        .map(task => (
                            <div key={task.id} className="task-item completed-task">
                                <div className="task-content">
                                    <h4 className="completed-text">{task.text}</h4>
                                    {task.due_date && <p>Was due: {formatDueDate(task.due_date)}</p>}
                                </div>
                                <span className="completion-check">✅</span>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* OPTION 4: Table format */}
            <div className="table-layout">
                <h2>Task Table</h2>
                <table className="tasks-table">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Due Date</th>
                            <th>Type</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id} className={task.is_completed ? 'completed-row' : 'active-row'}>
                                <td className={task.is_completed ? 'completed-text' : ''}>{task.text}</td>
                                <td>{formatDueDate(task.due_date)}</td>
                                <td>{task.task_type || '-'}</td>
                                <td>
                                    {task.task_class && (
                                        <span className={`priority-badge ${getPriorityClass(task.task_class)}`}>
                                            {task.task_class}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className={`status-badge ${task.is_completed ? 'completed' : 'pending'}`}>
                                        {task.is_completed ? 'Done' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* OPTION 5: Minimal list (most common) */}
            <div className="minimal-list">
                <h2>Tasks</h2>
                {tasks.map(task => (
                    <div key={task.id} className={`task-row ${task.is_completed ? 'completed' : 'active'}`}>
                        <div className="task-main">
                            <span className={`task-text ${task.is_completed ? 'strike-through' : ''}`}>
                                {task.text}
                            </span>
                            {task.due_date && (
                                <span className="due-info">{formatDueDate(task.due_date)}</span>
                            )}
                        </div>
                        <div className="task-badges">
                            {task.task_type && <span className="type-badge">{task.task_type}</span>}
                            {task.task_class && <span className={`priority-badge ${task.task_class}`}>{task.task_class}</span>}
                            <span className={`status-indicator ${task.is_completed ? 'done' : 'todo'}`}>
                                {task.is_completed ? '✅' : '○'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}