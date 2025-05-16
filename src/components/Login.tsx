import {useUser} from './contexts/UserContext';
import {userlist} from "./types.ts";
import {useState} from "preact/hooks";
import type {JSX} from "preact";

export default function Login() {
    // const {user, setUser} = useUser();
    const [username, setUsername] = useState('');

    const handleLogin = (username: string) => {
        const foundUser = userlist.find(u => u.name === username);
        if (foundUser) {
            // setUser(foundUser);
            alert(`Welcome, ${foundUser.name}!`);
        } else {
            alert('User not found');
        }
    };

    const handleInputChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
        // Use e.currentTarget.value
        setUsername(e.currentTarget.value);
    };

    return (
        <div className="flex flex-row ">
            <p>
                <span className="text-2xl font-bold">Login</span>
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
    );
}
