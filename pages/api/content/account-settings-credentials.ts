import fs from 'fs'

import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import validate from '@/helpers/validate'

// limit the body parser to 50 MB.
export const config = { api: { bodyParser: { sizeLimit: '50mb' } } }

/*
    NOTES:
        if you already set the body parser limit and still experiencing error: 413 "entity too large"
        all you need to do is set the nginx.conf "client_max_body_size" limit.

        *   switch to "root" user by typing the command below and your "root" password.

            su root

        *   then go to this directory.

            cd /etc/nginx

        *   edit the "nginx.conf" file by typing.

            sudo nano nginx.conf

        *   add these additional configuration in the "http" object block.

            # set client body size limit to 50MB
            client_max_body_size 50M;
        
        *   then save the file by pressing "ctrl+s" and exit editor by pressing "ctrl+x"
        
        *   check if theres an error in the configuration by typing.

            sudo nginx -t

        *   if theres no error at all restart the "nginx.service" by typing.

            sudo systemctl restart nginx

        *   see the status of "nginx.service" by typing.

            sudo systemctl status nginx

        *   then reboot the system by typing.

            sudo reboot
*/

// account-settings/credentials.tsx
export default async function handler ( req: NextApiRequest , res: NextApiResponse <any> ) {

    try {

        switch ( req.method ) {

            default:
                res.status( 404 ).send( 'Cannot GET /' )
            break

            case 'POST':

                const { payload , file } = req.body
                const header: string = String( req.headers[ 'x-access-authentication' ] )
        
                const createEncryptedPayload = new CreateEncryptedPayload()
        
                const decrypt_payload: any = createEncryptedPayload.parse( payload )
                const decrypt_header: string = createEncryptedPayload.parse( header )

                if ( decrypt_header === decrypt_payload.serial ) {

                    switch ( decrypt_payload.command ) {

                        default:
                            res.status( 405 ).send( 'Method Not Allowed' )
                        break

                        case 'upload':

                            try {

                                const validateImage = (): any | void => {

                                    if ( file.image === '' ) {

                                        return {
                                            pass: false,
                                            msg: 'no image file selected.',
                                            value: null
                                        }

                                    }

                                    else if ( file.size > 10000000 ) {

                                        return {
                                            pass: false,
                                            msg: 'image file size must not exceed to 10 MB.',
                                            value: null
                                        }

                                    }

                                    else if ( file.type !== 'image/jpeg' && file.type !== 'image/png' ) {

                                        return {
                                            pass: false,
                                            msg: 'invalid image, can only accept .jpg and .png format.',
                                            value: null
                                        }

                                    }

                                    else if ( file.image !== '' && file.size <= 10000000 && ( file.type === 'image/jpeg' || file.type === 'image/png' ) ) {
                                        
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: file.image
                                        }
                                    
                                    }

                                    else {

                                        return {
                                            pass: false,
                                            msg: 'unknown error.',
                                            value: file.image
                                        }

                                    }

                                }

                                const imageObj = validateImage()

                                if ( imageObj.pass ) {
                                    
                                    // find the recorded file "name"
                                    const getfilename: any = db.prepare( `SELECT image FROM users WHERE account = ?` ).get( decrypt_payload.account )
                                    
                                    // check if the file "name" is existed then delete the existing file.
                                    if ( getfilename.image !== '' ) {
                                        fs.unlinkSync( `../media-server/public/content/${ decrypt_payload.account }/${ getfilename.image }` )
                                    }

                                    // generate a new file "name"
                                    const filename = new GenerateSerial().keyCode( { length: 16 } )

                                    // create file base on file "type"
                                    switch ( file.type ) {
            
                                        default:
                                            res.status( 405 ).send( 'Method Not Allowed' )
                                        break
            
                                        case 'image/png':
            
                                            try {
            
                                                const parseFile = imageObj.value.replace( /^data:image\/png;base64,/ , '' )
                                                const pathExist = fs.existsSync( `../media-server/public/content/${ decrypt_payload.account }` )
            
                                                db.prepare( `UPDATE users SET image = ? WHERE account = ?` ).run( `user-profile-${ filename }.png` , decrypt_payload.account )
                                                
                                                // check if the path is exist if exist just create 
                                                if ( pathExist ) {
            
                                                    fs.writeFileSync( `../media-server/public/content/${ decrypt_payload.account }/user-profile-${ filename }.png` , parseFile , 'base64' )
                                                    
                                                } else {
                                                    
                                                    fs.mkdirSync( `../media-server/public/content/${ decrypt_payload.account }` , { recursive: true } )
                                                    fs.writeFileSync( `../media-server/public/content/${ decrypt_payload.account }/user-profile-${ filename }.png` , parseFile , 'base64' )
                            
                                                }
            
            
                                            } catch ( err ) {
            
                                                if ( err ) {
                                                    console.log( err )
                                                    res.status( 500 ).send( 'Internal Server Error' )
                                                }
            
                                            }
            
                                        break
            
                                        case 'image/jpeg':
            
                                            try {
            
                                                const parseFile = imageObj.value.replace( /^data:image\/jpeg;base64,/ , '' )
                                                const pathExist = fs.existsSync( `../media-server/public/content/${ decrypt_payload.account }` )
                                                
                                                db.prepare( `UPDATE users SET image = ? WHERE account = ?` ).run( `user-profile-${ filename }.jpg` , decrypt_payload.account )
            
                                                if ( pathExist ) {
            
                                                    fs.writeFileSync( `../media-server/public/content/${ decrypt_payload.account }/user-profile-${ filename }.jpg` , parseFile , 'base64' )
            
                                                } else {
            
                                                    fs.mkdirSync( `../media-server/public/content/${ decrypt_payload.account }` , { recursive: true } )
                                                    fs.writeFileSync( `../media-server/public/content/${ decrypt_payload.account }/user-profile-${ filename }.jpg` , parseFile , 'base64' )
            
                                                }
            
            
                                            } catch ( err ) {
            
                                                if ( err ) {
                                                    console.log( err )
                                                    res.status( 500 ).send( 'Internal Server Error' )
                                                }
            
                                            }
            
                                        break
            
                                    }

                                }

                                res.status( 200 ).send( {
                                    image: {
                                        pass: imageObj.pass,
                                        msg: imageObj.msg
                                    },
                                } )

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'update':

                            try {

                                const validateName = (): any | void => {

                                    return validate.name( { name: decrypt_payload.name } )
                                    
                                }
            
                                const validateUsername = (): any | void => {
                                    
                                    const user: any = db.prepare( `SELECT * FROM users WHERE username = ?` ).get( decrypt_payload.username )
                                    const userbind: any = db.prepare( `SELECT * FROM users WHERE account = ? AND username = ?` ).get( decrypt_payload.account , decrypt_payload.username )

                                    /*
                                        in the first condition if both the "user" and "userbind" returns a record
                                        this implies to submitting the same credentials of the current login user
                                        so just pass the values to validate the string.
                                    */

                                    if ( user && userbind ) {
            
                                        return validate.username( { username: decrypt_payload.username } )
            
                                    }

                                    /*
                                        the second condition is to find if the both the "user" and "userbind" did
                                        not return any value this happens when the current login user enters a "different username"
                                        if this is the case just pass the values to validate the string.
                                    */

                                    else if ( user === undefined && userbind === undefined ) {

                                        return validate.username( { username: decrypt_payload.username } )
            
                                    }

                                    /*
                                        any other scenario will refer to "username" is already existed in the
                                        database.
                                    */

                                    else {

                                        return {
                                            pass: false,
                                            msg: 'username is already exist.',
                                            value: null
                                        }

                                    }
            
                                }
            
                                const validatePassword = (): any | void => {
            
                                    const user: any = db.prepare( `SELECT * FROM users WHERE account = ?` ).get( decrypt_payload.account )
                                    const decrypt_password: any = createEncryptedPayload.parse( user.password )
            
                                    if ( decrypt_payload.current_password === '' ) {
            
                                        return {
                                            pass: false,
                                            msg: 'one or more password fields are empty.',
                                            value: null
                                        }
            
                                    }
            
                                    else if ( decrypt_payload.current_password !== decrypt_password ) {
            
                                        return {
                                            pass: false,
                                            msg: 'your old password is not bind to this account.',
                                            value: null
                                        }
            
                                    }
                                    
                                    else if ( decrypt_payload.new_password === decrypt_password ) {
            
                                        return {
                                            pass: false,
                                            msg: 'you cannot use a same password.',
                                            value: null
                                        }
            
                                    }
            
                                    else {
            
                                        return validate.password( { password_a: decrypt_payload.new_password , password_b: decrypt_payload.retype_password } )
            
                                    }
            
                                }
            
                                const nameObj = validateName()
                                const usernameObj = validateUsername()
                                const passwordObj = validatePassword()
            
                                if ( nameObj.pass && usernameObj.pass && passwordObj.pass ) {
                                    
                                    db.prepare( `UPDATE users SET username = ? , password = ? , name = ? WHERE account = ?` ).run( usernameObj.value , createEncryptedPayload.wrap( passwordObj.value ) , nameObj.value , decrypt_payload.account )
            
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

                        break

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
