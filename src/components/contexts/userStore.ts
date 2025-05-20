import {persistentAtom} from '@nanostores/persistent'
import {useStore} from "@nanostores/preact";

const initialUser = ''

export const userStore = persistentAtom<string>('user', initialUser)

export function loginUser(username: string) {
    userStore.set(username)
}

export function logoutUser() {
    userStore.set(initialUser)
}

export function useUser(): string {
    return useStore(userStore)
}
