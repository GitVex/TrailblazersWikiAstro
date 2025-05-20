import {loginUser, logoutUser, user,} from "./stores/UserStateStore.ts";
import {userlist} from "./types.ts";
import {useRef, useState} from "preact/hooks";
import type {JSX} from "preact";

export default function Login() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState('');

    const handleLogin = (username: string) => {
        const foundUser = userlist.find(u => u.name.toLowerCase() === username.toLowerCase());
        if (!foundUser) {
            alert('User not found');
            inputRef.current?.focus();
            return;
        }

        if (foundUser.isAdmin) {
            // Open a modal asking for the password
            const password = prompt('Enter admin password:');
            if (!password) {
                alert('Password is required');
                inputRef.current?.focus();
                return;
            }

            if (password === foundUser.password) {
                loginUser(foundUser.name);
            } else {
                alert('Incorrect password');
                inputRef.current?.focus();
            }
        } else {
            loginUser(foundUser.name)
        }
    };

    const handleInputChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
        // Use e.currentTarget.value
        setUsername(e.currentTarget.value);
    };

    return (
        !user.value ? (
            <div className="flex flex-row gap-2">
                <p>
                    <span className="font-bold">Login</span>
                </p>
                <>
                    <input
                        type="text"
                        placeholder="Username"
                        onInput={handleInputChange}
                    />
                    <button onClick={() => handleLogin(username)}>Login</button>
                </>
            </div>
        ) : (
            <div className="flex flex-row gap-2">
                <p>
                    <span className="font-bold">Logged in as: {user}</span>
                </p>
                <button onClick={() => logoutUser()}>Logout</button>
            </div>
        )
    );
}
