import fs from 'fs'

import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import validator from 'validator'

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

// account-settings/configuration.tsx
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

                if ( decrypt_header === decrypt_payload.serial && decrypt_payload.role === 'admin' ) {

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
                                    const getfilename: any = db.prepare( `SELECT system_image FROM system_settings WHERE id = ?` ).get( 1 )

                                    // check if the file "name" is existed then delete the existing file.
                                    if ( getfilename.system_image !== '' ) {
                                        fs.unlinkSync( `../media-server/public/system/${ getfilename.system_image }` )
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
                                                const pathExist = fs.existsSync( `../media-server/public/system` )

                                                db.prepare( `UPDATE system_settings SET system_image = ? WHERE id = ?` ).run( `${ filename }.png` , 1 )
                                                
                                                // check if the path is exist if exist just create 
                                                if ( pathExist ) {
            
                                                    fs.writeFileSync( `../media-server/public/system/${ filename }.png` , parseFile , 'base64' )

                                                } else {
                                                    
                                                    fs.mkdirSync( `../media-server/public/system` , { recursive: true } )
                                                    fs.writeFileSync( `../media-server/public/system/${ filename }.png` , parseFile , 'base64' )

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
                                                const pathExist = fs.existsSync( `../media-server/public/system` )

                                                db.prepare( `UPDATE system_settings SET system_image = ? WHERE id = ?` ).run( `${ filename }.jpg` , 1 )
                                                            
                                                if ( pathExist ) {
            
                                                    fs.writeFileSync( `../media-server/public/system/${ filename }.jpg` , parseFile , 'base64' )

                                                } else {
            
                                                    fs.mkdirSync( `../media-server/public/system` , { recursive: true } )
                                                    fs.writeFileSync( `../media-server/public/system/${ filename }.jpg` , parseFile , 'base64' )

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

                            const validateContactLimit = validator.isNumeric( String( decrypt_payload.contact_limit ) , { no_symbols: true } )
                            const validateSignupFeature = typeof decrypt_payload.signup_feature === 'boolean'
                            const validateUserUpload = typeof decrypt_payload.user_upload === 'boolean'
                            const validateContactsUpload = typeof decrypt_payload.contacts_upload === 'boolean'

                            const sf = decrypt_payload.signup_feature ? 1 : 0
                            const uu = decrypt_payload.user_upload ? 1 : 0
                            const cu = decrypt_payload.contacts_upload ? 1 : 0

                            if ( !validateContactLimit ) {

                                res.status( 200 ).send( {
                                    config: {
                                        pass: false,
                                        msg: 'invalid format, cannot contain + - . symbols.'
                                    }
                                } )

                            }

                            else if ( validateSignupFeature && validateUserUpload && validateContactsUpload ) {

                                db.prepare( `UPDATE system_settings SET contact_limit = ? , signup_feature = ? , user_upload = ? , contacts_upload = ? WHERE id = ?` ).run( Number( decrypt_payload.contact_limit ) , sf , uu , cu , 1 )

                                res.status( 200 ).send( {
                                    config: {
                                        pass: true,
                                        msg: ''
                                    }
                                } )

                            }

                            else {

                                res.status( 405 ).send( 'Method Not Allowed' )

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
