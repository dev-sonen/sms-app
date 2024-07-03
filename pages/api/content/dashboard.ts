import fs from 'fs'

import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'
import directories from '@/config/directories.config.json'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import DateTimeFormat from '@/classes/datetime-format'
import GenerateSerial from '@/classes/generate-serial'
import Paginate from '@/classes/paginate'
import validate from '@/helpers/validate'

import validator from 'validator'

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
                    const save_location: string = directories.queue

                    switch ( decrypt_payload.command ) {

                        default:
                            res.status( 405 ).send( 'Method Not Allowed' )
                        break

                        case 'search-contact':

                            try {

                                const arr: any = db.prepare( `
                                    SELECT
                                        cid,
                                        mobile_no,
                                        owners_name,
                                        group_name,
                                        group_id,
                                        image
                                    FROM
                                        contacts
                                    WHERE
                                        ( cid LIKE ? OR mobile_no LIKE ? OR owners_name LIKE ? )
                                ` ).all( `${ decrypt_payload.search }%` , `%${ decrypt_payload.search }%` , `%${ decrypt_payload.search }%` )

                                if ( arr.length !== 0 ) {

                                    const paginate = new Paginate( arr , { size: 10 } )

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

                        case 'search-group':

                            try {

                                const arr: any = db.prepare( `
                                    SELECT
                                        gid,
                                        name,
                                        location,
                                        lng,
                                        lat,
                                        image
                                    FROM
                                        groups
                                    WHERE
                                        ( gid LIKE ? OR name LIKE ? )
                                ` ).all( `${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` )

                                if ( arr.length !== 0 ) {

                                    const paginate = new Paginate( arr , { size: 10 } )

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

                        case 'search-template':

                            try {

                                const arr: any = db.prepare( `
                                    SELECT
                                        tid,
                                        title,
                                        content,
                                        color
                                    FROM
                                        templates
                                    WHERE
                                        ( title LIKE ? OR content LIKE ? OR color LIKE ? )
                                ` ).all( `%${ decrypt_payload.search }%` , `%${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` )

                                if ( arr.length !== 0 ) {

                                    const paginate = new Paginate( arr , { size: 4 } ) // 15
    
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

                        case 'search-contacts-within-group':

                            try {

                                const group: any = db.prepare( `
                                    SELECT
                                        gid,
                                        name,
                                        location,
                                        lng,
                                        lat
                                    FROM
                                        groups
                                    WHERE
                                        lng != ? AND lat != ? 
                                ` ).all( '' , '' )

                                const groupObj: any[] = group.map( ( obj: any , ind: number ) => {

                                    return {
                                        ... obj,
                                        contacts: db.prepare( `
                                            SELECT
                                                cid,
                                                mobile_no,
                                                owners_name
                                            FROM
                                                contacts
                                            WHERE
                                                group_id = ?
                                        ` ).all( obj.gid )
                                    }

                                } )

                                res.status( 200 ).send( groupObj )

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'send':

                            try {

                                const { type , user , contacts , message , flash } = decrypt_payload

                                switch ( type ) {

                                    default:
                                        res.status( 405 ).send( 'Method Not Allowed' )
                                    break

                                    case 'single':

                                        try {

                                            const validateMobileno = (): any | void => {

                                                // this will filter any duplicate values.
                                                const filter_duplicate: any[] = Array.from( new Set( contacts ) ).filter( ( arr: any ) => arr !== '' )

                                                // check if the array for mobile numbers is not empty.
                                                if ( filter_duplicate.length !== 0 ) {
                                                    
                                                    // check if each mobile numbers are valid return 1 if true else return 0
                                                    const valid: number[] = filter_duplicate.map( ( arr: string , ind: number ) => {
                                                        const { pass }: any = validate.mobileno( { no: arr } )
                                                        return pass ? 1 : 0
                                                    } )
                
                                                    // if the reduce value is equal to the length of the array that contains all the mobile number.
                                                    if ( valid.reduce( ( a: number , b: number ) => a + b , 0 ) === filter_duplicate.length ) {
                                                        return {
                                                            pass: true,
                                                            msg: '',
                                                            value: filter_duplicate
                                                        }
                                                    }
                                                    
                                                    // if not equal return false.
                                                    return {
                                                        pass: false,
                                                        msg: 'some mobile numbers are invalid.',
                                                        value: null
                                                    }

                                                }

                                                // if empty return false.
                                                return {
                                                    pass: false,
                                                    msg: 'please add a recipient.',
                                                    value: null
                                                }

            
                                            }
            
                                            const validateMessage = (): any | void => {
            
                                                if ( message === '' ) {
                                                    return {
                                                        pass: false,
                                                        msg: 'you cannot send an empty message.',
                                                        value: ''
                                                    }
                                                }
            
                                                const validate_message = validator.isAlphanumeric( message , 'en-US' , { ignore: ' .,-_?!@#%&()/$' } )
                                                const check_length = message.length
            
                                                if ( check_length > 300 ) {
                                                    return {
                                                        pass: false,
                                                        msg: 'message payload must not exceed 300 characters.',
                                                        value: null
                                                    }
                                                }
            
                                                if ( validate_message && check_length <= 300 ) {
                                                    return {
                                                        pass: true,
                                                        msg: '',
                                                        value: message
                                                    }
                                                }
            
                                                return {
                                                    pass: false,
                                                    msg: 'invalid characters ~`^*+={}[]|\\:;"\'<> for message.',
                                                    value: null
                                                }
            
                                            }
            
                                            const mobilenoObj = validateMobileno()
                                            const messageObj = validateMessage()
            
                                            if ( mobilenoObj.pass && messageObj.pass ) {
            
                                                mobilenoObj.value.map( ( arr: string , ind: number ) => {
                                                    
                                                    // create unique filenames each loop.
                                                    const filename = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )
                                                    
                                                    // datetime
                                                    const datetimeFormat = new DateTimeFormat( new Date() )
                                                    const date = datetimeFormat.dateOnly( 'string' , { separator: '-' , mm: 'numericalwithzeros' , dd: 'numericalwithzeros' , yy: 'full' } )
                                                    const time = datetimeFormat.timeOnly( 'string' , { separator: ':' , hh: '24hr' , hd: 'numericalwithzeros' , mn: 'numericalwithzeros' , ss: 'numericalwithzeros' } )
                                                    
                                                    /*
                                                        Write the phone number in international format without the leading +. When you like to send a 
                                                        message to a short number (for example to order a ringtone), then preceed it with an "s".
                
                                                        see: http://smstools3.kekekasvi.com/index.php?p=fileformat
                                                    */
                                                    const mobile_no = arr.replace( /^0/g , '63' )

                                                    // sent id.
                                                    const sid = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )
                                                    
                                                    // add record in the database.
                                                    db.prepare( `
                                                        INSERT INTO
                                                            sent
                                                            ( sid , sender , send_to , message , datetime , message_type , flash , payload_file )
                                                        VALUES
                                                            ( ? , ? , ? , ? , ? , ? , ? , ? )
                                                    ` ).run( sid , user , arr.replace( /^0/g , '+63' ) , messageObj.value , `${ date } ${ time }` , 'single' , flash ? 1 : 0 , filename )
                                                    
                                                    // write file.
                                                    fs.appendFileSync( `${ save_location }/${ filename }` , `To: ${ mobile_no }\n${ flash ? 'Flash: yes\nAlphabet: ISO\n\n' : '\n' }${ messageObj.value }` )
            
                                                } )
            
                                            }
            
                                            res.status( 200 ).send( {
                                                contactno: {
                                                    pass: mobilenoObj.pass,
                                                    msg: mobilenoObj.msg
                                                },
                                                message: {
                                                    pass: messageObj.pass,
                                                    msg: messageObj.msg
                                                }
                                            } )

                                        } catch ( err ) {
                                            console.log( err )
                                            res.status( 500 ).send( 'Internal Server Error' )
                                        }

                                    break

                                    case 'group':

                                        try {

                                            type arr = [ string ]
                                            const [ group ]: arr = contacts

                                            const format_uppercase = group.toUpperCase()

                                            const validateGroup = (): any | void => {

                                                // find the group id.
                                                const exist = db.prepare( `SELECT gid , name FROM groups WHERE gid = ?` ).get( format_uppercase )

                                                // if the group id is existed.
                                                if ( exist ) {

                                                    // get all the mobile numbers within that group.
                                                    const contactswithingroup: any = db.prepare( `
                                                        SELECT
                                                            mobile_no,
                                                            owners_name
                                                        FROM
                                                            contacts
                                                        WHERE
                                                            group_id = ?
                                                    ` ).all( format_uppercase )

                                                    // if the group is existed and has contacts.
                                                    if ( contactswithingroup.length !== 0 ) {

                                                        return {
                                                            pass: true,
                                                            msg: '',
                                                            value: contactswithingroup
                                                        }

                                                    }

                                                    // if the group is existed but no existing contacts.
                                                    return {
                                                        pass: false,
                                                        msg: 'there are no existing contacts within this group.',
                                                        value: null
                                                    }

                                                }

                                                // if the group id is not existed.
                                                return {
                                                    pass: false,
                                                    msg: 'group is invalid or not existed.',
                                                    value: null
                                                }
                                                
                                            }

                                            const validateMessage = (): any | void => {
            
                                                if ( message === '' ) {
                                                    return {
                                                        pass: false,
                                                        msg: 'you cannot send an empty message.',
                                                        value: ''
                                                    }
                                                }
            
                                                const validate_message = validator.isAlphanumeric( message , 'en-US' , { ignore: ' .,-_?!@#%&()/$' } )
                                                const check_length = message.length
            
                                                if ( check_length > 300 ) {
                                                    return {
                                                        pass: false,
                                                        msg: 'message payload must not exceed 300 characters.',
                                                        value: null
                                                    }
                                                }
            
                                                if ( validate_message && check_length <= 300 ) {
                                                    return {
                                                        pass: true,
                                                        msg: '',
                                                        value: message
                                                    }
                                                }
            
                                                return {
                                                    pass: false,
                                                    msg: 'invalid characters ~`^*+={}[]|\\:;"\'<> for message.',
                                                    value: null
                                                }
            
                                            }

                                            const groupObj = validateGroup()
                                            const messageObj = validateMessage()

                                            if ( groupObj.pass && messageObj.pass ) {

                                                /*
                                                    this approach ensures that one record is added to the
                                                    database when sending a message using "group", but also
                                                    generates unique filenames separated by ", " these will
                                                    avoid large amount off records in the table.
                                                */

                                                /*
                                                    Write the phone number in international format without the leading +. When you like to send a 
                                                    message to a short number (for example to order a ringtone), then preceed it with an "s".
            
                                                    see: http://smstools3.kekekasvi.com/index.php?p=fileformat
                                                */

                                                // sent id.
                                                const sid = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )

                                                // join recipients using ", " as a separator.
                                                const join_recipients = groupObj.value.map( ( obj: any , ind: number ) => obj.mobile_no ).join( ', ' )

                                                // datetime
                                                const datetimeFormat = new DateTimeFormat( new Date() )
                                                const date = datetimeFormat.dateOnly( 'string' , { separator: '-' , mm: 'numericalwithzeros' , dd: 'numericalwithzeros' , yy: 'full' } )
                                                const time = datetimeFormat.timeOnly( 'string' , { separator: ':' , hh: '24hr' , hd: 'numericalwithzeros' , mn: 'numericalwithzeros' , ss: 'numericalwithzeros' } )

                                                // add the corresponding records to the database except the filename.
                                                db.prepare( `
                                                    INSERT INTO
                                                        sent
                                                        ( sid , sender , send_to , message , datetime , message_type , flash , payload_file )
                                                    VALUES
                                                        ( ? , ? , ? , ? , ? , ? , ? , ? )
                                                ` ).run( sid , user , join_recipients , messageObj.value , `${ date } ${ time }` , 'group' , flash ? 1 : 0 , '' )
                                                
                                                // create unique file and payload.
                                                const filenames = groupObj.value.map( ( obj: any , ind: number ) => {

                                                    // create unique filenames each loop.
                                                    const filename = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )

                                                    /*
                                                        Write the phone number in international format without the leading +. When you like to send a 
                                                        message to a short number (for example to order a ringtone), then preceed it with an "s".
                
                                                        see: http://smstools3.kekekasvi.com/index.php?p=fileformat
                                                    */
                                                    const mobile_no = obj.mobile_no.replace( /^\+63/g , '63' )

                                                    // write file.
                                                    fs.appendFileSync( `${ save_location }/${ filename }` , `To: ${ mobile_no }\n${ flash ? 'Flash: yes\nAlphabet: ISO\n\n' : '\n' }${ messageObj.value }` )

                                                    // return the filename value.
                                                    return filename

                                                } )

                                                // join filenames using ", " as a separator.
                                                const join_filenames = filenames.join( ', ' )

                                                // update the record and append the joined filenames.
                                                db.prepare( `
                                                    UPDATE
                                                        sent
                                                    SET
                                                        payload_file = ?
                                                    WHERE
                                                        sid = ?
                                                ` ).run( join_filenames , sid )

                                            }

                                            res.status( 200 ).send( {
                                                contactno: {
                                                    pass: groupObj.pass,
                                                    msg: groupObj.msg
                                                },
                                                message: {
                                                    pass: messageObj.pass,
                                                    msg: messageObj.msg
                                                }
                                            } )

                                        } catch ( err ) {
                                            console.log( err )
                                            res.status( 500 ).send( 'Internal Server Error' )
                                        }

                                    break

                                }

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'check-map-send':

                            try {

                                const { user , gid , message , flash } =  decrypt_payload

                                const validatePayload = (): any | void => {
            
                                    if ( message === '' ) {
                                        return {
                                            pass: false,
                                            msg: 'you cannot send an empty message.',
                                            value: ''
                                        }
                                    }

                                    const validate_message = validator.isAlphanumeric( message , 'en-US' , { ignore: ' .,-_?!@#%&()/$' } )
                                    const check_length = message.length

                                    if ( check_length > 300 ) {
                                        return {
                                            pass: false,
                                            msg: 'message payload must not exceed 300 characters.',
                                            value: null
                                        }
                                    }

                                    if ( validate_message && check_length <= 300 ) {

                                        const contacts: any[] = db.prepare( `
                                            SELECT
                                                mobile_no,
                                                owners_name
                                            FROM
                                                contacts
                                            WHERE
                                                group_id = ?
                                        ` ).all( gid )

                                        if ( contacts.length === 0 ) {
                                        
                                            return {
                                                pass: false,
                                                msg: 'there are no contacts within this group.',
                                                value: null
                                            }
    
                                        }
    
                                        if ( contacts.length !== 0 ) {
    
                                            return {
                                                pass: true,
                                                msg: '',
                                                value: contacts
                                            }
    
                                        }
    
                                        return {
                                            pass: false,
                                            msg: 'unknown error.',
                                            value: null
                                        }

                                    }

                                    return {
                                        pass: false,
                                        msg: 'invalid characters ~`^*+={}[]|\\:;"\'<> for message.',
                                        value: null
                                    }

                                }

                                const payloadObj = validatePayload()

                                if ( payloadObj.pass ) {

                                    /*
                                        this approach ensures that one record is added to the
                                        database when sending a message using "group", but also
                                        generates unique filenames separated by ", " these will
                                        avoid large amount off records in the table.
                                    */

                                    /*
                                        Write the phone number in international format without the leading +. When you like to send a 
                                        message to a short number (for example to order a ringtone), then preceed it with an "s".

                                        see: http://smstools3.kekekasvi.com/index.php?p=fileformat
                                    */

                                    // sent id.
                                    const sid = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )

                                    // join recipients using ", " as a separator.
                                    const join_recipients = payloadObj.value.map( ( obj: any , ind: number ) => obj.mobile_no ).join( ', ' )

                                    // datetime
                                    const datetimeFormat = new DateTimeFormat( new Date() )
                                    const date = datetimeFormat.dateOnly( 'string' , { separator: '-' , mm: 'numericalwithzeros' , dd: 'numericalwithzeros' , yy: 'full' } )
                                    const time = datetimeFormat.timeOnly( 'string' , { separator: ':' , hh: '24hr' , hd: 'numericalwithzeros' , mn: 'numericalwithzeros' , ss: 'numericalwithzeros' } )

                                    // add the corresponding records to the database except the filename.
                                    db.prepare( `
                                        INSERT INTO
                                            sent
                                            ( sid , sender , send_to , message , datetime , message_type , flash , payload_file )
                                        VALUES
                                            ( ? , ? , ? , ? , ? , ? , ? , ? )
                                    ` ).run( sid , user , join_recipients , message , `${ date } ${ time }` , 'group' , flash ? 1 : 0 , '' )

                                    // create unique file and payload.
                                    const filenames = payloadObj.value.map( ( obj: any , ind: number ) => {

                                        // create unique filenames each loop.
                                        const filename = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )

                                        /*
                                            Write the phone number in international format without the leading +. When you like to send a 
                                            message to a short number (for example to order a ringtone), then preceed it with an "s".
    
                                            see: http://smstools3.kekekasvi.com/index.php?p=fileformat
                                        */
                                        const mobile_no = obj.mobile_no.replace( /^\+63/g , '63' )

                                        // write file.
                                        fs.appendFileSync( `${ save_location }/${ filename }` , `To: ${ mobile_no }\n${ flash ? 'Flash: yes\nAlphabet: ISO\n\n' : '\n' }${ message }` )

                                        // return the filename value.
                                        return filename

                                    } )

                                    // join filenames using ", " as a separator.
                                    const join_filenames = filenames.join( ', ' )

                                    // update the record and append the joined filenames.
                                    db.prepare( `
                                        UPDATE
                                            sent
                                        SET
                                            payload_file = ?
                                        WHERE
                                            sid = ?
                                    ` ).run( join_filenames , sid )

                                }

                                res.status( 200 ).send( {
                                    message: {
                                        pass: payloadObj.pass,
                                        msg: payloadObj.msg
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

                }

            break

        }

    } catch ( err ) {
        console.log( err )
        res.status( 500 ).send( 'Internal Server Error' )
    }

}
