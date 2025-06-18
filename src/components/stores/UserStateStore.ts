import { signal, effect } from '@preact/signals';
import {userlist} from "../types.ts";
import type { elevatedUserList} from "../../../plugins/remark/util/remarkOfWikiLinks-utils.ts";


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

export function isAuthed(allowedUsers: string[] | undefined) {
    if (userlist.find(u => u.name === user.value.trim())?.isAdmin) {
        return true
    } else if (!allowedUsers || allowedUsers.length === 0) {
        return false
    } else if (allowedUsers.includes('all')) {
        return true
    }
    console.log("None of the above apply ... checking", user.value, "against", allowedUsers)
    return allowedUsers.includes(user.value.trim())
}

export function isElevated(elevatedUsers: elevatedUserList | undefined, elevationLevel: number, debug: boolean = false) {
    const keys = Object.keys(elevatedUsers || {})

    if (userlist.find(u => u.name === user.value)?.isAdmin) {
        return !debug
    } else if (!elevatedUsers ||  keys.length=== 0) {
        return false
    } else if (keys.includes('all')) {
        return true
    }

    return (elevatedUsers[user.value] ?? 0) >= elevationLevel
}
