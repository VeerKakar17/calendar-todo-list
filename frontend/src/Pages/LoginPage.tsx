import React, {useState} from 'react';
import { APIError, fetchData } from '../App';
import { useNavigate } from 'react-router-dom';

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    function attemptLogin() {
        if (!username || !password) {
            console.log("Must input username or password");
            return;
        }
        
        const body: Record<string, string> = {
            username,
            password
        }

        fetchData("/login", "POST", body).then( response => {
            navigate("/");
        }).catch((e : Error) => {
            console.log("Error getting tasks: " + e.message);
        });
    }

    return (
        <>
        <div className="login-container">
            <input 
                type="text"
                value={username}
                onChange={e => {setUsername(e.target.value)}}
            />
            <input
                type="text"
                value={"*".repeat(password.length)}
                onChange={e => {
                    if (e.target.value.length > password.length) {
                        setPassword(password + e.target.value[e.target.value.length-1]);
                    } else if (e.target.value.length < password.length) {
                        setPassword(password.substring(0, e.target.value.length));
                    }
                }}
                onPaste={e => e.preventDefault()}
            />
            <button onClick={attemptLogin}>
                Login
            </button>
            <button onClick={() => {navigate("/create-user")}}>
                Create User
            </button>
        </div>
        </>
    );
}