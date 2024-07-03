import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import validate from '@/helpers/validate'

// signup.tsx
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

                if ( decrypt_header === decrypt_payload.serial ) {

                    try {

                        const validateName = (): any | void => {

                            return validate.name( { name: decrypt_payload.name } )

                        }

                        const validateUsername = (): any | void => {

                            const finduser: any = db.prepare( `SELECT * FROM users WHERE username = ?` ).get( decrypt_payload.username )

                            if ( finduser ) {

                                return {
                                    pass: false,
                                    msg: 'username is already exist.',
                                    value: null
                                }

                            }

                            return validate.username( { username: decrypt_payload.username } )

                        }

                        const validatePassword = (): any | void => {

                            return validate.password( { password_a: decrypt_payload.password , password_b: decrypt_payload.retype } )

                        }

                        const nameObj = validateName()
                        const usernameObj = validateUsername()
                        const passwordObj = validatePassword()

                        if ( nameObj.pass && usernameObj.pass && passwordObj.pass ) {

                            const generateSerial = new GenerateSerial( { setof: 'alphanumericlow' } )

                            const password: string = createEncryptedPayload.wrap( decrypt_payload.password )
                            const account: string = generateSerial.uniqueId( '' , { length: 5 , series: 3 } )

                            db.prepare( `INSERT INTO users ( account , username , password , role , name , image ) VALUES ( ? , ? , ? , ? , ? , ? )` ).run( account , decrypt_payload.username , password , 'user' , decrypt_payload.name , '' )

                            db.prepare( `INSERT INTO priveledges_send ( account , username , role , send_nmsg , send_fmsg , send_gmsg , send_smsg ) VALUES ( ? , ? , ? , ? , ? , ? , ? )` ).run( account , decrypt_payload.username , 'user' , 0 , 0 , 0 , 0 )
                            db.prepare( `INSERT INTO priveledges_inbox ( account , username , role , inbox_read , inbox_del ) VALUES ( ? , ? , ? , ? , ? )` ).run( account , decrypt_payload.username , 'user' , 0 , 0 )
                            db.prepare( `INSERT INTO priveledges_contacts ( account , username , role , contacts_add , contacts_edit , contacts_del ) VALUES ( ? , ? , ? , ? , ? , ? )` ).run( account , decrypt_payload.username , 'user' , 0 , 0 , 0 )
                            db.prepare( `INSERT INTO priveledges_groups ( account , username , role , groups_add , groups_edit , groups_del ) VALUES ( ? , ? , ? , ? , ? , ? )` ).run( account , decrypt_payload.username , 'user' , 0 , 0 , 0 )
                            db.prepare( `INSERT INTO priveledges_template ( account , username , role , template_create , template_edit , template_del ) VALUES ( ? , ? , ? , ? , ? , ? )` ).run( account , decrypt_payload.username , 'user' , 0 , 0 , 0 )
                            db.prepare( `INSERT INTO priveledges_sent ( account , username , role , sent_del ) VALUES ( ? , ? , ? , ? )` ).run( account , decrypt_payload.username , 'user' , 0 )
                            db.prepare( `INSERT INTO priveledges_queue ( account , username , role , queue_del ) VALUES ( ? , ? , ? , ? )` ).run( account , decrypt_payload.username , 'user' , 0 )
                            db.prepare( `INSERT INTO priveledges_failed ( account , username , role , failed_del ) VALUES ( ? , ? , ? , ? )` ).run( account , decrypt_payload.username , 'user' , 0 )

                        }

                        res.status( 200 ).send( {
                            name: {
                                pass: nameObj.pass,
                                msg: nameObj.msg
                            },
                            username: {
                                pass: usernameObj.pass,
                                msg: usernameObj.msg
                            },
                            password: {
                                pass: passwordObj.pass,
                                msg: passwordObj.msg
                            }
                        } )

                    } catch ( err ) {

                        if ( err ) {
                            console.log( err )
                            res.status( 500 ).send( 'Internal Server Error' )
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
