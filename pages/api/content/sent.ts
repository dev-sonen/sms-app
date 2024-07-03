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
                    const save_location: string = directories.sent

                    switch ( decrypt_payload.command ) {

                        default:
                            res.status( 405 ).send( 'Method Not Allowed' )
                        break

                        case 'search':

                            try {

                                const arr: any = db.prepare( `
                                    SELECT
                                        sid,
                                        sender,
                                        send_to,
                                        message,
                                        datetime,
                                        message_type,
                                        flash
                                    FROM
                                        sent
                                    WHERE
                                        ( sender LIKE ? OR send_to LIKE ? OR message LIKE ? OR datetime LIKE ? OR message_type LIKE ? )
                                ` ).all( `%${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` , `%${ decrypt_payload.search }%` , `%${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` )

                                /*
                                    check if the queue folder in the /var/spool/sms
                                    has files on it that indicates that some message
                                    are not successfully sent.
                                */
                                const check_queue = fs.readdirSync( directories.queue )

                                if ( arr.length !== 0 && check_queue.length === 0 ) {

                                    const paginate = new Paginate( arr , { size: 15 } ) // 15
    
                                    res.status( 200 ).send( {
                                        chunk: paginate.getChunk().chunks[ decrypt_payload.page - 1 ],
                                        length: paginate.getChunk().length,
                                        // if the queue folder has no files ruturn false
                                        queue: false
                                    } )

                                } else {

                                    res.status( 200 ).send( {
                                        chunk: [],
                                        length: 0,
                                        // if the queue folder contains files then return true if not return false. 
                                        queue: check_queue.length !== 0 ? true : false
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

                                const sent_ids: string[] = decrypt_payload.sids

                                sent_ids.map( ( arr: string , ind: number ) => {

                                    /*
                                        this will also remove all the uploaded files
                                        for that contacts.
                                    */
                                    
                                    // find the recorded file "name"
                                    const getfilename: any = db.prepare( `
                                        SELECT
                                            payload_file
                                        FROM
                                            sent
                                        WHERE
                                            sid = ?
                                    ` ).get( arr )

                                    // split the files string into array.
                                    const files: string[] = getfilename.payload_file.split( ', ' )

                                    // map and delete files using "rmSync"
                                    files.map( ( arr: string , ind: number ) => {
                                        fs.rmSync( `${ save_location }/${ arr }` , { recursive: true , force: true } )
                                    } )

                                    // delete the sent.
                                    db.prepare( `
                                        DELETE FROM
                                            sent
                                        WHERE
                                            sid = ?
                                    ` ).run( arr )

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

                else {
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
