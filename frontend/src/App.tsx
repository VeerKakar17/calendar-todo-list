import React from 'react';
import './App.css';
import { Todolist } from './Pages/Todolist';
import { Route, BrowserRouter as Router, useRoutes } from 'react-router-dom';
import {Login} from './Pages/LoginPage'
import { CreateUser, CreateUserSuccess } from './Pages/CreateUserPage';

function Routes() {
  const element = useRoutes([
    { path: "/", element: <Todolist />},
    { path: "/todolist", element: <Todolist />},
    { path: "/login", element: <Login />},
    { path: "/create-user", element: <CreateUser />},
    { path: "/create-user/success", element: <CreateUserSuccess />},
    { path: "*", element: <NotFound />}
  ]);

  return element;
}

function App() {
  return (
    <Router>
      <Routes/>
    </Router>
  );
}

function NotFound() {
  return (
    <div>
      <h2>404: Page Not Found</h2>
      <p>Uh oh, that's not right!</p>
    </div>
  );
}

interface ErrorResponse {
  detail: string;
}

export class APIError extends Error {
  public statusCode: number;
  public details: string;

  constructor(statusCode: number, details: string) {
    super(details);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'APIError'
  }
}

export async function fetchData<T = any>(path: string, method: string, body?: Record<string, any> | null): Promise<T> {
  const requestOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  };

  try {
    const response = await fetch('http://localhost:8000' + path, requestOptions);
    
    if (!response.ok) {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text) as ErrorResponse;
        console.log("1 " + errorData.detail);
        throw new APIError(response.status, errorData.detail);
      } catch (er) {
        // If JSON parsing fails, use the raw text
        if (er instanceof APIError) {
          throw er;
        }
        throw new APIError(response.status, text || `HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    } else {
      return await response.text() as T;
    }
  } catch (error: any) {
    console.error('Error fetching data: ', error.message);
    
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(0, error.message || 'Network error occurred');
  }
}

export default App;
