import NextAuth , { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'

// signin.tsx
const authOptions: NextAuthOptions = {

    providers: [

        CredentialsProvider ( {

            // @ts-ignore
            authorize: async ( credentials: any , req: any ) => {
                
                try {

                    const { payload } = credentials
                    const header: string = String( req.headers[ 'x-access-authentication' ] )

                    const createEncryptedPayload = new CreateEncryptedPayload()

                    const decrypt_payload: any = createEncryptedPayload.parse( payload )
                    const decrypt_header: string = createEncryptedPayload.parse( header )

                    const { username , password } = decrypt_payload

                    if ( decrypt_header === req.query.serial ) {

                        const find_user: any = await db.prepare( `SELECT * FROM users WHERE username = ?` ).get( username )
    
                        if ( find_user !== undefined ) {

                            const recorded_password: string = createEncryptedPayload.parse( find_user.password )
    
                            if ( username === find_user.username && password === recorded_password ) {
                                
                                /*
                                    if you want a custom session return, you must pass the value of "account" to the "email"
                                    property since "email" property is predefine by nextauth, this property is essential since callback "jwt"
                                    will only read this "property" as basis for successfull login. 
                                */

                                return { email: find_user.account }
                            
                            }

                            return null
    
                        }

                        return null

                    }

                    return null

                } catch ( err ) {

                    if ( err ) {
                        console.log( err )
                        return null
                    }

                }

            }

        } )

    ],
    secret: 'this-is-a-secret',
    callbacks: {
        jwt: async ( { token } ) => {

            /*
                "token" refers to the return value in the "authorize" property in the "CredentialsProvider" on top.
            */

            return token 

        },
        session: async ( { session , token } ) => {

            /*
                "token" refers to the return value in the "jwt" callback at the top, this section will
                generate a session that will expires in a certain given time in the "session" property below and
                return a custom value for the client side cookies, you can use the "useSession()" hook
                to get its value.
            */
            
            // this will override the property "email" as "account"
            return { account: token.email , expires: session.expires }

        }
    },
    session: {
        strategy: 'jwt',
        // session will expired within a week "604800" seconds is equal to "7" days.
        maxAge: 604800
    },
    pages: {
        signIn: '/',
        error: '/500'
    }

}

export default NextAuth ( authOptions )
