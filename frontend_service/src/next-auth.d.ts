import NextAuth from 'next-auth'

declare module "next-auth" {
    interface Session {
        user: {
            _id: string,
            name: string,
            email: string,
            telephone: string,
            role: string,
            token: string,
            dentist_id?: string
        }
    }
}