import fs from 'fs'

import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'
import directories from '@/config/directories.config.json'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import Paginate from '@/classes/paginate'

/*
    if the usb module does not presented or detected using the following commands.
    
    "dmesg | grep ttyUSB"
    "picocom /dev/ttyUSB0 -b 9600 -l"
    "sudo smsd -C modem1"
    
    see this thread for fix:
    https://askubuntu.com/questions/1403705/dev-ttyusb0-not-present-in-ubuntu-22-04

    save files are located to:
    /var/spool/sms
*/

export default async function handler ( req: NextApiRequest , res: NextApiResponse <any> ) {
    
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

                    // edit the "directories.config.json"
                    const save_location: string = directories.inbox

                    switch ( decrypt_payload.command ) {

                        default:
                            res.status( 405 ).send( 'Method Not Allowed' )
                        break

                        case 'search':

                            try {

                                // get all "file names" inside a folder and return an "array string".
                                const files = fs.readdirSync( save_location )

                                // map all the files and its content.
                                const arr: any[] = files.map( ( arr: string , ind: number ) => {

                                    // read the content of the file
                                    const content = fs.readFileSync( `${ save_location }/${ arr }` , { encoding: 'utf-8' , flag: 'r' } )

                                    // convert it to array.
                                    const toarray = content.replace( /\n/g , '|' ).split( '|' )

                                    /*
                                        map the properties with matching regex of "from" and "received"
                                        if regex is match return an "obj" that corresponds that property
                                        return "null" if not.

                                        then "filter the array" that is "not equal to null" and return
                                        a sigle value
                                        
                                        de-structure the array to get the obj.
                                    */ 
                                    const [ from ]: any = toarray.map( ( arr: string , ind: number ) => /From:/g.test( arr ) ? { from: arr.replace( /From: /g , '' ).replace( /^63/g , '+63' ) } : null ).filter( ( arr: any ) => arr !== null )
                                    const [ received ]: any = toarray.map( ( arr: string , ind: number ) => /Received:/g.test( arr ) ? { received: arr.replace( /Received: /g , '' ) }: null ).filter( ( arr: any ) => arr !== null )

                                    // get also the name of the contact number
                                    const findname: any = db.prepare( `SELECT owners_name FROM contacts WHERE mobile_no = ?` ).get( from.from )

                                    return {
                                        file: arr,                                                                  // file name.
                                        name: findname !== undefined ? findname.owners_name : '',                   // contact name.
                                        ... from,                                                                   // using spread to pass the value "from"
                                        ... received,                                                               // using spread to pass the value "received"
                                        message: toarray[ toarray.length - 1 ]                                      // the last index is the message.
                                    }

                                } )

                                if ( arr.length !== 0 ) {

                                    const paginate = new Paginate( arr , { size: 15 } ) // 15
    
                                    res.status( 200 ).send( {
                                        chunk: paginate.getChunk().chunks[ decrypt_payload.page - 1 ],
                                        length: paginate.getChunk().length
                                    } )

                                } else {

                                    res.status( 200 ).send( {
                                        chunk: [],
                                        length: 0
                                    } )

                                }

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'delete':

                            try {

                                const files: string[] = decrypt_payload.filename

                                /*
                                    map and delete the file in the "incoming" folder
                                    in the "/var/spool/sms/incoming" directory.
                                */
                                files.map( ( arr: string , ind: number ) => {
                                    fs.rmSync( `${ save_location }/${ arr }` , { recursive: true , force: true } )
                                } )

                                res.end()

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                    }

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
