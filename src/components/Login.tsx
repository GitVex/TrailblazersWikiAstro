import { loginUser, logoutUser, user } from "./stores/UserStateStore.ts";
import { userlist } from "./types.ts"; // Assuming userlist contains users with name, isAdmin, password
import { useRef, useState } from "preact/hooks";
import type { JSX } from "preact";

export default function Login() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState('');

    const handleLogin = (usernameToLogin: string) => {
        const foundUser = userlist.find(u => u.name.toLowerCase() === usernameToLogin.toLowerCase());
        if (!foundUser) {
            alert('User not found');
            setUsername(''); // Clear input on error
            inputRef.current?.focus();
            return;
        }

        if (foundUser.isAdmin) {
            const password = prompt('Enter admin password:');
            if (!password) {
                // alert('Password is required'); // Prompt itself handles empty input to some extent
                inputRef.current?.focus();
                return;
            }

            if (password === foundUser.password) {
                loginUser(foundUser.name);
                setUsername(''); // Clear input on successful login
            } else {
                alert('Incorrect password');
                inputRef.current?.focus();
            }
        } else {
            loginUser(foundUser.name);
            setUsername(''); // Clear input on successful login
        }
    };

    const handleInputChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
        setUsername(e.currentTarget.value);
    };

    const handleKeyPress = (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLogin(username);
        }
    };

    return (
        !user.value ? (
            // Logged-out state
            <div className="flex flex-row items-center gap-1.5 p-1">
                {/* Optional: A very small label if needed
                <span className="text-xs text-gray-400">Login:</span>
                */}
                <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    placeholder="Username"
                    onInput={handleInputChange}
                    onKeyPress={handleKeyPress} // Added Enter key submission
                    className="text-xs px-2 py-1 w-24 bg-gray-700 text-gray-200 border border-gray-500 rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                    aria-label="Username"
                />
                <button
                    onClick={() => handleLogin(username)}
                    className="text-xs px-2.5 py-1 bg-slate-600 hover:bg-slate-500 text-gray-200 font-medium rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
                    aria-label="Login button"
                >
                    Login
                </button>
            </div>
        ) : (
            // Logged-in state
            <div className="flex flex-row items-center gap-2 p-1">
                <p className="text-xs text-gray-400">
                    Logged in as: <span className="font-semibold text-gray-200">{String(user.value)}</span>
                </p>
                <button
                    onClick={() => logoutUser()}
                    className="text-xs text-gray-400 hover:text-gray-100 hover:underline focus:outline-none focus:text-gray-100 focus:underline"
                    aria-label="Logout button"
                >
                    Logout
                </button>
            </div>
        )
    );
}