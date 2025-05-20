import { signal, effect } from '@preact/signals';


const initialUser = ''
const USER_KEY = 'current-user'

function getInitialValue(): string {
    try {
        const storedValue = localStorage.getItem(USER_KEY)
        if (storedValue) {
            return storedValue
        }
    } catch (e) {
        console.error("Caught error while fetching from localStorage:", e)
    }
    return initialUser
}

export const user = signal<string>(getInitialValue())

effect(() => {
    try {
        localStorage.setItem(USER_KEY, user.value)
    } catch (e) {
        console.error("Caught error while saving to localStorage:", e)
    }
})

export function loginUser(username: string) {
    user.value = username
}

export function logoutUser() {
    user.value = initialUser
}
