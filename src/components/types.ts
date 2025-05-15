export interface User {
    name: string,
    password?: string
    isAdmin: boolean,
}

export const userlist: User[] = [
    {
        "name": "paul",
        "password": "adminpassword",
        "isAdmin": true
    },
    {
        "name": "leon",
        "isAdmin": false
    },
    {
        "name": "Erich",
        "isAdmin": false
    },
    {
        "name": "Tim",
        "isAdmin": false
    },
    {
        "name": "Nils",
        "isAdmin": false
    },
    {
        "name": "Phillip",
        "isAdmin": false,
    },
]
