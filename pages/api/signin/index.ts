import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'

// signin.tsx
export default async function handler( req: NextApiRequest , res: NextApiResponse <any> ) {
    
    try {

        switch ( req.method ) {

            default:
                res.status( 404 ).send( 'Cannot GET /' )
            break

            case 'POST':

                const { payload } = req.body
                const header: string = String( req.headers[ 'x-access-authentication' ] )
        
                const createEncryptedPayload = new CreateEncryptedPayload()
        
                const decrypt_payload: any = createEncryptedPayload.parse( payload )
                const decrypt_header: string = createEncryptedPayload.parse( header )

                const { serial , username , password } = decrypt_payload

                if ( decrypt_header === serial ) {

                    if ( username === '' || password === '' ) {

                        res.status( 200 ).send( { code: 'd235' , payload: null } )

                    } else {

                        const find_user: any = await db.prepare( `SELECT * FROM users WHERE username = ?` ).get( username )

                        if ( find_user === undefined ) {

                            res.status( 200 ).send( { code: 'e928' , payload: null } )

                        } else {

                            const recorded_password: string = createEncryptedPayload.parse( find_user.password )

                            if ( username === find_user.username && password === recorded_password ) {
                    
                                res.status( 200 ).send( { code: '5c85' , payload: payload } )
                    
                            } else {
                    
                                res.status( 200 ).send( { code: '27f1' , payload: null } )
                    
                            }

                        }

                    }
                     
                } else {

                    res.status( 405 ).send( 'Method Not Allowed' )

                }

            break

        }

    } catch ( err ) {

        if ( err ) {
            console.log( err )
            res.status( 500 ).send( 'Internal Server Error' )
        }

    }

}
