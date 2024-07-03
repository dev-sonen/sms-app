import fs from 'fs'

import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'
import Paginate from '@/classes/paginate'

import validator from 'validator'

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

// contacts/list-contacts.tsx
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

                    switch ( decrypt_payload.command ) {

                        default:
                            res.status( 405 ).send( 'Method Not Allowed' )
                        break

                        case 'search':

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
                                        ( cid LIKE ? OR mobile_no LIKE ? OR owners_name LIKE ? OR group_name LIKE ? OR group_id LIKE ? )
                                ` ).all( `${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` )

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

                        case 'groupid':

                            try {   

                                const gid: any = db.prepare( `
                                    SELECT
                                        gid,
                                        name
                                    FROM
                                        groups
                                ` ).all()

                                res.status( 200 ).send( gid )

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'add':

                            try {

                                const validateMobileno = (): any | void => {
                                    
                                    return validate.mobileno( { no: decrypt_payload.mobile_no } )

                                }

                                const validateContactname = (): any | void => {

                                    return validate.contactname( { name: decrypt_payload.contact_name } )

                                }

                                const validateGroupid = (): any | void => {

                                    // get the contact limit.
                                    const { contact_limit }: any = db.prepare( `
                                        SELECT
                                            contact_limit
                                        FROM
                                            system_settings
                                        WHERE
                                            id = ?
                                    ` ).get( 1 )

                                    const contactswithingroup: any = db.prepare( `
                                        SELECT
                                            *
                                        FROM
                                            contacts
                                        WHERE
                                            group_id = ?
                                    ` ).all( decrypt_payload.group_id )

                                    if ( decrypt_payload.group_id === '' ) {
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: ''
                                        }
                                    }

                                    if ( contactswithingroup.length >= contact_limit ) {

                                        return {
                                            pass: false,
                                            msg: `you cannot add more than ${ contact_limit } contacts within a group.`,
                                            value: null
                                        }

                                    } else {

                                        const existed: any = db.prepare( `
                                            SELECT
                                                gid,
                                                name
                                            FROM
                                                groups
                                            WHERE
                                                gid = ?
                                        ` ).get( decrypt_payload.group_id )

                                        if ( existed ) {
                                            return {
                                                pass: true,
                                                msg: '',
                                                value: decrypt_payload.group_id
                                            }
                                        }

                                        return {
                                            pass: false,
                                            msg: 'invalid group id.',
                                            value: null
                                        }

                                    }

                                }

                                const mobilenoObj = validateMobileno()
                                const contactnameObj = validateContactname()
                                const groupidObj = validateGroupid()

                                if ( mobilenoObj.pass && contactnameObj.pass && groupidObj.pass ) {

                                    const mobile_no = mobilenoObj.value.replace( /^0/g , '+63' )
                                    const cid = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )

                                    const group: any = groupidObj.value === '' ? { gid: '' , name: '' } : db.prepare( `
                                        SELECT
                                            gid,
                                            name
                                        FROM
                                            groups
                                        WHERE
                                            gid = ?
                                    ` ).get( groupidObj.value )

                                    db.prepare( `
                                        INSERT INTO
                                            contacts
                                            ( cid , mobile_no , owners_name , group_name , group_id , image )
                                        VALUES
                                            ( ? , ? , ? , ? , ? , ? )
                                    ` ).run( cid , mobile_no , contactnameObj.value , group.name , group.gid , '' )

                                }

                                res.status( 200 ).send( {
                                    mobile_no: {
                                        pass: mobilenoObj.pass,
                                        msg: mobilenoObj.msg
                                    },
                                    contact_name: {
                                        pass: contactnameObj.pass,
                                        msg: contactnameObj.msg
                                    },
                                    group_id:{
                                        pass: groupidObj.pass,
                                        msg: groupidObj.msg
                                    }
                                } )

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'delete':

                            try {

                                const contact_ids: string[] = decrypt_payload.cids

                                contact_ids.map( ( arr: string ) => {

                                    /*
                                        this will also remove all the uploaded files
                                        for that contacts.
                                    */
                                    
                                    // find the recorded file "name"
                                    const getfilename: any = db.prepare( `
                                        SELECT
                                            image
                                        FROM
                                            contacts
                                        WHERE
                                            cid = ?
                                    ` ).get( arr )

                                    // check if the file "name" is existed then delete the existing file.
                                    if ( getfilename.image !== '' ) {
                                        fs.rmSync( `../media-server/public/content/contacts/${ arr }` , { recursive: true , force: true } )
                                    }

                                    // delete the contact.
                                    db.prepare( `
                                        DELETE FROM
                                            contacts
                                        WHERE
                                            cid = ?
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

                        case 'move':

                            try {

                                const group_id: string = decrypt_payload.gid
                                const contact_ids: string[] = decrypt_payload.cids

                                if ( group_id === '' ) {

                                    res.status( 200 ).send( {
                                        pass: false,
                                        msg: 'no group selected.'
                                    } )

                                } else {

                                    const validateGroupid = (): any | void => {

                                        // get the contact limit.
                                        const { contact_limit }: any = db.prepare( `
                                            SELECT
                                                contact_limit
                                            FROM
                                                system_settings
                                            WHERE
                                                id = ?
                                        ` ).get( 1 )

                                        const contactswithingroup: any = db.prepare( `
                                            SELECT
                                                *
                                            FROM
                                                contacts
                                            WHERE
                                                group_id = ?
                                        ` ).all( group_id )

                                        if ( contact_ids.length > contact_limit ) {

                                            return {
                                                pass: false,
                                                msg: `you cannot add more than ${ contact_limit } contacts within a group.`,
                                                value: null
                                            }
    
                                        } 
                                        
                                        if ( contactswithingroup.length + contact_ids.length > contact_limit ) {

                                            return {
                                                pass: false,
                                                msg: `${ group_id } has ${ contactswithingroup.length } contacts already +${ contact_ids.length } [limit: ${ contact_limit }]`,
                                                value: null
                                            }

                                        }
                                        
                                        else {
    
                                            const existed: any = db.prepare( `
                                                SELECT
                                                    gid,
                                                    name
                                                FROM
                                                    groups
                                                WHERE
                                                    gid = ?
                                            ` ).get( group_id )
    
                                            if ( existed ) {
                                                return {
                                                    pass: true,
                                                    msg: '',
                                                    value: group_id
                                                }
                                            }
    
                                            return {
                                                pass: false,
                                                msg: 'invalid group id.',
                                                value: null
                                            }
    
                                        }
    
                                    }

                                    const groupidObj = validateGroupid()

                                    if ( groupidObj.pass ) {

                                        const getgroupinfo: any = db.prepare( `
                                            SELECT
                                                gid,
                                                name
                                            FROM
                                                groups
                                            WHERE
                                                gid = ?
                                        ` ).get( group_id )

                                        contact_ids.map( ( arr: string ) => {

                                            db.prepare( `
                                                UPDATE
                                                    contacts
                                                SET
                                                    group_name = ?,
                                                    group_id = ?
                                                WHERE
                                                    cid = ?
                                            ` ).run( getgroupinfo.name , getgroupinfo.gid , arr )

                                        } )

                                    }

                                    res.status( 200 ).send( {
                                        pass: groupidObj.pass,
                                        msg: groupidObj.msg
                                    } )

                                }

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'import':

                            try {

                                const { obj } = decrypt_payload

                                if ( obj.length === 0 ) {

                                    res.status( 200 ).send( {
                                        list: {
                                            pass: false,
                                            msg: [ 'empty payload.' ]
                                        }
                                    } )

                                } else {

                                    const validateMnAll = () => {

                                        // array container for invalid msg.
                                        const msg: string[] = []

                                        // loop through array and validate.
                                        const mn: number[] = obj.map( ( arr: any , ind: number ) => {

                                            const mobileno: Function = ( params: { no: string } = { no: '' } ): { pass: boolean , msg: string , value: string | null } | void => {

                                                try {

                                                    if ( params.no === '' ) {
                                                        return {
                                                            pass: false,
                                                            msg: 'some mobile no. properties are empty.',
                                                            value: null
                                                        }
                                                    }
                                        
                                                    const validate_mobileno: boolean = validator.isNumeric( params.no )
                                                    const validate_length: boolean = params.no.length >= 11
                                                    const check_code = /^0895|0896|0897|0898|0991|0992|0993|0994|0908|0918|0919|0920|0921|0928|0929|0939|0946|0947|0949|0951|0961|0998|0999|0907|0909|0910|0912|0930|0938|0946|0948|0950|0922|0923|0924|0925|0931|0932|0933|0934|0940|0941|0942|0943|0973|0974|0817|09173|09175|09176|09178|09253|09255|09256|09257|09258|0905|0906|0915|0916|0917|0926|0927|0935|0936|0937|0945|0953|0954|0955|0956|0965|0966|0967|0975|0976|0977|0978|0979|0995|0996|0997/g.test( params.no )
                                        
                                                    if ( check_code === false ) {
                                                        return {
                                                            pass: false,
                                                            msg: 'network is unknown.',
                                                            value: null
                                                        }
                                                    }
                                        
                                                    if ( validate_length === false ) {
                                                        return {
                                                            pass: false,
                                                            msg: 'mobile no. must atleast 11 digits.',
                                                            value: null
                                                        }
                                                    }
                                        
                                                    if ( validate_mobileno && validate_length ) {
                                                        return {
                                                            pass: true,
                                                            msg: '',
                                                            value: params.no
                                                        }
                                                    }
                                        
                                                    return {
                                                        pass: false,
                                                        msg: 'some numbers are invalid.',
                                                        value: null
                                                    }
                                        
                                                } catch ( err ) {
                                        
                                                    if ( err ) {
                                        
                                                        console.error( err )
                                                        return {
                                                            pass: false,
                                                            msg: 'an error occurred.',
                                                            value: null
                                                        }
                                                        
                                                    }
                                        
                                                }

                                            }

                                            const vObj: any = mobileno( { no: arr.mobile_no } )

                                            // push "msg" value in the "msg" array.
                                            msg.push( vObj.msg )

                                            // if "pass" value is "true" return "1" else return "0"
                                            return vObj.pass ? 1 : 0

                                        } )

                                        // get unique array value using set then filter any values that is ""
                                        const filter_msg: string[] = Array.from( new Set( msg ) ).filter( ( arr: any ) => arr !== '' )

                                        /*
                                            "reduce" all the "numeric" value that is returned from "mn"
                                            and if the "reduce" value is equal to the length of the "obj"
                                            return "pass" as "true" meaning all values are valid.
                                        */
                                        if ( mn.reduce( ( a: number , b: number ) => a + b , 0 ) === obj.length ) {
                                            
                                            return {
                                                pass: true,
                                                msg: []
                                            }

                                        }

                                        // if not return "pass" as "false".
                                        return {
                                            pass: false,
                                            msg: filter_msg
                                        }

                                    }

                                    const validateCnAll = () => {

                                        // array container for invalid msg.
                                        const msg: string[] = []

                                        // loop through array and validate.
                                        const cn: number[] = obj.map( ( arr: any , ind: number ) => {

                                            const contactname: Function = ( params: { name: string }  = { name: '' } ): { pass: boolean , msg: string , value: string | null } | void => {

                                                try {

                                                    if ( params.name === '' ) {
                                        
                                                        return {
                                                            pass: true,
                                                            msg: '',
                                                            value: ''
                                                        }
                                        
                                                    } else {
                                        
                                                        const validate_contactname: boolean = validator.isAlpha( params.name , 'en-US' )
                                        
                                                        if ( validate_contactname ) {
                                                            return {
                                                                pass: true,
                                                                msg: '',
                                                                value: params.name
                                                            }
                                                        }
                                        
                                                        return {
                                                            pass: false,
                                                            msg: 'name fields contain numbers or special characters.',
                                                            value: null
                                                        }
                                        
                                                    }
                                        
                                                } catch ( err ) {
                                        
                                                    if ( err ) {
                                        
                                                        console.error( err )
                                                        return {
                                                            pass: false,
                                                            msg: 'an error occurred.',
                                                            value: null
                                                        }
                                                        
                                                    }
                                        
                                                }

                                            }

                                            const vObj: any = contactname( { name: arr.owners_name } )

                                            // push "msg" value in the "msg" array.
                                            msg.push( vObj.msg )

                                            // if "pass" value is "true" return "1" else return "0"
                                            return vObj.pass ? 1 : 0

                                        } )

                                        // get unique array value using set then filter any values that is ""
                                        const filter_msg: string[] = Array.from( new Set( msg ) ).filter( ( arr: any ) => arr !== '' )

                                        /*
                                            "reduce" all the "numeric" value that is returned from "mn"
                                            and if the "reduce" value is equal to the length of the "obj"
                                            return "pass" as "true" meaning all values are valid.
                                        */
                                        if ( cn.reduce( ( a: number , b: number ) => a + b , 0 ) === obj.length ) {
                                        
                                            return {
                                                pass: true,
                                                msg: []
                                            }

                                        }

                                        // if not return "pass" as "false".
                                        return {
                                            pass: false,
                                            msg: filter_msg
                                        }

                                    }

                                    const validateGiAll = () => {

                                        // get contact limit.
                                        const { contact_limit }: any = db.prepare( `
                                            SELECT
                                                contact_limit
                                            FROM
                                                system_settings
                                            WHERE
                                                id = ?
                                        ` ).get( 1 )

                                        // get groups
                                        const getgroups: any[] = Array.from( new Set( obj.map( ( arr: any , ind: number ) => arr.group_id ) ) ).filter( ( arr: any ) => arr !== '' )

                                        // check if data is exceed to contact limit.
                                        const checklg = getgroups.map( ( arr: any ) => {

                                            const length = obj.filter( ( obj: any ) => obj.group_id === arr ).length
                                            return length > contact_limit ? `${ arr } has exceeded to ${ contact_limit } contacts limit per group.` : ''

                                        } ).filter( ( arr: any ) => arr !== '' )

                                        // check if the group has enough contacts base on the "database".
                                        const checkcd = getgroups.map( ( arr: any ) => {

                                            const length = obj.filter( ( obj: any ) => obj.group_id === arr ).length
                                            const contactswithingroup: any = db.prepare( `
                                                SELECT
                                                    group_id,
                                                    group_name
                                                FROM
                                                    contacts
                                                WHERE
                                                    group_id = ?
                                            ` ).all( arr ).length

                                            return length + contactswithingroup > contact_limit ? `${ arr } has ${ contactswithingroup } contacts already +${ length } [limit: ${ contact_limit }]` : ''

                                        } ).filter( ( arr: any ) => arr !== '' )

                                        // check if group id is existed.
                                        const checkgi = getgroups.map( ( arr: any ) => {

                                            const existed = db.prepare( `
                                                SELECT
                                                    gid,
                                                    name
                                                FROM
                                                    groups
                                                WHERE
                                                    gid = ?
                                            ` ).get( arr )

                                            return existed === undefined ? `${ arr } is invalid.` : ''

                                        } ).filter( ( arr: any ) => arr !== '' )

                                        return {
                                            pass: [ ... checklg , ... checkcd , ... checkgi ].length === 0,
                                            msg: [ ... checklg , ... checkcd , ... checkgi ]
                                        }

                                    }

                                    const mnObj = validateMnAll()
                                    const cnObj = validateCnAll()
                                    const giObj = validateGiAll()

                                    if ( mnObj.pass && cnObj.pass && giObj.pass ) {

                                        // get groups
                                        const getgroups: any[] = Array.from( new Set( obj.map( ( arr: any , ind: number ) => arr.group_id ) ) ).filter( ( arr: any ) => arr !== '' )

                                        // separate contacts with group id and without id.
                                        const withoutid: any[] = obj.filter( ( arr: any ) => arr.group_id === '' )
                                        const withid: any[] = obj.filter( ( arr: any ) => arr.group_id !== '' )

                                        // get the group "name" base on group "id"
                                        const groups: Array<{ gid: string , name: string }> = getgroups.map( ( arr: string , ind: number ) => {

                                            const grouplist: any = db.prepare( `
                                                SELECT
                                                    gid,
                                                    name
                                                FROM
                                                    groups
                                                WHERE
                                                    gid = ?
                                            ` ).get( arr )

                                            return grouplist

                                        } )

                                        const a = withoutid.map( ( obj: any , ind: number ) => { return { ... obj , group_name: '' } } )
                                        const b = withid.map( ( obj: any , ind: number ) => {

                                            const [ fill ] = groups.filter( ( arr: any , ind: number ) => arr.gid === obj.group_id )

                                            return {
                                                ... obj,
                                                group_name: fill.name
                                            }

                                        } )

                                        const merge: any[] = [ ... b , ... a ]

                                        merge.map( ( obj: any , ind: number ) => {

                                            const mobile_no = obj.mobile_no.replace( /^0/g , '+63' )
                                            const cid = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )

                                            db.prepare( `
                                                INSERT INTO
                                                    contacts
                                                    ( cid , mobile_no , owners_name , group_name , group_id , image )
                                                VALUES
                                                    ( ? , ? , ? , ? , ? , ? )
                                            ` ).run( cid , mobile_no , obj.owners_name , obj.group_name , obj.group_id , '' )

                                        } )

                                    }

                                    res.status( 200 ).send( {
                                        list: {
                                            pass: mnObj.pass && cnObj.pass && giObj.pass ? true : false,
                                            msg: [ ... mnObj.msg , ... cnObj.msg , ... giObj.msg ]
                                        }
                                    } )

                                }


                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'upload':

                            try {

                                const { image , type , size } = req.body.file

                                const validateImage = (): any | void => {

                                    if ( image === '' ) {

                                        return {
                                            pass: false,
                                            msg: 'no image file selected.',
                                            value: null
                                        }

                                    }

                                    else if ( size > 10000000 ) {

                                        return {
                                            pass: false,
                                            msg: 'image file size must not exceed to 10 MB.',
                                            value: null
                                        }

                                    }

                                    else if ( type !== 'image/jpeg' && type !== 'image/png' ) {

                                        return {
                                            pass: false,
                                            msg: 'invalid image, can only accept .jpg and .png format.',
                                            value: null
                                        }

                                    }

                                    else if ( image !== '' && size <= 10000000 && ( type === 'image/jpeg' || type === 'image/png' ) ) {
                                        
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: image
                                        }
                                    
                                    }

                                    else {

                                        return {
                                            pass: false,
                                            msg: 'unknown error.',
                                            value: image
                                        }

                                    }

                                }

                                const imageObj = validateImage()

                                if ( imageObj.pass ) {

                                    // find the recorded file "name"
                                    const getfilename: any = db.prepare( `
                                        SELECT
                                            image
                                        FROM
                                            contacts
                                        WHERE
                                            cid = ?
                                    ` ).get( decrypt_payload.cid )

                                    // check if the file "name" is existed then delete the existing file.
                                    if ( getfilename.image !== '' ) {
                                        fs.unlinkSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }/${ getfilename.image }` )
                                    }

                                    // generate a new file "name"
                                    const filename = new GenerateSerial().keyCode( { length: 16 } )

                                    // create file base on file "type"
                                    switch ( type ) {

                                        default:
                                            res.status( 405 ).send( 'Method Not Allowed' )
                                        break
            
                                        case 'image/png':
            
                                            try {
            
                                                const parseFile = imageObj.value.replace( /^data:image\/png;base64,/ , '' )
                                                const pathExist = fs.existsSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }` )

                                                db.prepare( `
                                                    UPDATE
                                                        contacts
                                                    SET
                                                        image = ?
                                                    WHERE
                                                        cid = ?
                                                ` ).run( `contact-img-${ filename }.png` , decrypt_payload.cid )
                                                
                                                // check if the path is exist if exist just create 
                                                if ( pathExist ) {
            
                                                    fs.writeFileSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }/contact-img-${ filename }.png` , parseFile , 'base64' )

                                                } else {
                                                    
                                                    fs.mkdirSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }` , { recursive: true } )
                                                    fs.writeFileSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }/contact-img-${ filename }.png` , parseFile , 'base64' )

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
                                                const pathExist = fs.existsSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }` )

                                                db.prepare( `
                                                    UPDATE
                                                        contacts
                                                    SET
                                                        image = ?
                                                    WHERE
                                                        cid = ?
                                                ` ).run( `contact-img-${ filename }.jpg` , decrypt_payload.cid )
                                                            
                                                if ( pathExist ) {
            
                                                    fs.writeFileSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }/contact-img-${ filename }.jpg` , parseFile , 'base64' )

                                                } else {
            
                                                    fs.mkdirSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }` , { recursive: true } )
                                                    fs.writeFileSync( `../media-server/public/content/contacts/${ decrypt_payload.cid }/contact-img-${ filename }.jpg` , parseFile , 'base64' )

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
                                    }
                                } )

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'edit':

                            try {

                                const validateMobileno = (): any | void => {
                                    
                                    return validate.mobileno( { no: decrypt_payload.mobile_no } )

                                }

                                const validateContactname = (): any | void => {

                                    return validate.contactname( { name: decrypt_payload.contact_name } )

                                }

                                const mobilenoObj = validateMobileno()
                                const contactnameObj = validateContactname()

                                if ( mobilenoObj.pass && contactnameObj.pass ) {

                                    const mobile_no = mobilenoObj.value.replace( /^0/g , '+63' )

                                    db.prepare( `
                                        UPDATE
                                            contacts
                                        SET
                                            mobile_no = ?,
                                            owners_name = ?
                                        WHERE
                                            cid = ?
                                    ` ).run( mobile_no , contactnameObj.value , decrypt_payload.cid )

                                }

                                res.status( 200 ).send( {
                                    mobile_no: {
                                        pass: mobilenoObj.pass,
                                        msg: mobilenoObj.msg
                                    },
                                    contact_name: {
                                        pass: contactnameObj.pass,
                                        msg: contactnameObj.msg
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
