import React, {useState} from 'react';
import { APIError, fetchData } from '../App';
import { useNavigate } from 'react-router-dom';

export function CreateUser() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    function attemptCreateUser() {
        if (!username || !password || !confirmPassword || !email) {
            console.log("Must input username or password");
            return;
        }
        if (password !== confirmPassword) {
            console.log("Passwords must match");
            return;
        }
        
        const body: Record<string, string> = {
            username,
            email,
            password
        }

        fetchData("/users", "POST", body).then( response => {
            navigate("/create-user/success");
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
                value={email}
                onChange={e => {setEmail(e.target.value)}}
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
            <input
                type="text"
                value={"*".repeat(confirmPassword.length)}
                onChange={e => {
                    if (e.target.value.length > confirmPassword.length) {
                        setConfirmPassword(confirmPassword + e.target.value[e.target.value.length-1]);
                    } else if (e.target.value.length < password.length) {
                        setConfirmPassword(confirmPassword.substring(0, e.target.value.length));
                    }
                }}
                onPaste={e => e.preventDefault()}
            />
            <button onClick={attemptCreateUser}>
                Create User
            </button>
            <button onClick={() => {navigate("/login")}}>
                Login
            </button>
        </div>
        </>
    );
}

export function CreateUserSuccess() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Successfully Created User. Please go to login page.</h2>
            <button onClick={() => navigate("/login")}>
                Login
            </button>
        </div>
    );
}