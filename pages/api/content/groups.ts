import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import Paginate from '@/classes/paginate'

import validate from '@/helpers/validate'

// contacts/list-groups.tsx
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
                                        gid,
                                        name,
                                        location,
                                        lng,
                                        lat,
                                        image
                                    FROM
                                        groups
                                    WHERE
                                        ( gid LIKE ? OR name LIKE ? OR location LIKE ? )
                                ` ).all( `${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` )

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

                        case 'add':

                            try {

                                const validateGroupname = (): any | void => {
                                    // replace 2 instance of white spaces with one
                                    return validate.groupname( { name: decrypt_payload.group_name.replace( /\s\s/g , '' ) } )

                                }

                                const validateLocation = (): any | void => {
                                    // replace 2 instance of white spaces with one
                                    return validate.location( { location: decrypt_payload.location.replace( /\s\s/g , '' ) } )

                                }

                                const validateXAxis = (): any | void => {

                                    return validate.mapaxis( { axis: decrypt_payload.lng } )

                                }

                                const validateYAxis = (): any | void => {

                                    return validate.mapaxis( { axis: decrypt_payload.lat } )

                                }

                                const groupnameObj = validateGroupname()
                                const locationObj = validateLocation()
                                const xaxisObj = validateXAxis()
                                const yaxisObj = validateYAxis()

                                if ( groupnameObj.pass && locationObj.pass && xaxisObj.pass && yaxisObj.pass ) {

                                    db.prepare( `
                                        INSERT INTO
                                            groups
                                            ( gid , name , location , lng , lat , image )
                                        VALUES
                                            ( ? , ? , ? , ? , ? , ? )
                                    ` ).run( decrypt_payload.group_id , decrypt_payload.group_name , decrypt_payload.location , decrypt_payload.lng , decrypt_payload.lat , '' )

                                }
                                
                                res.status( 200 ).send( {
                                    group_name: {
                                        pass: groupnameObj.pass,
                                        msg: groupnameObj.msg
                                    },
                                    location: {
                                        pass: locationObj.pass,
                                        msg: locationObj.msg
                                    },
                                    lng: {
                                        pass: xaxisObj.pass,
                                        msg: xaxisObj.msg
                                    },
                                    lat: {
                                        pass: yaxisObj.pass,
                                        msg: yaxisObj.msg
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

                                const validateLocation = (): any | void => {
                                    // replace 2 instance of white spaces with one
                                    return validate.location( { location: decrypt_payload.location.replace( /\s\s/g , '' ) } )

                                }

                                const validateXAxis = (): any | void => {

                                    return validate.mapaxis( { axis: decrypt_payload.lng } )

                                }

                                const validateYAxis = (): any | void => {

                                    return validate.mapaxis( { axis: decrypt_payload.lat } )

                                }

                                const locationObj = validateLocation()
                                const xaxisObj = validateXAxis()
                                const yaxisObj = validateYAxis()

                                if ( locationObj.pass && xaxisObj.pass && yaxisObj.pass ) {

                                    db.prepare( `
                                        UPDATE
                                            groups
                                        SET
                                            location = ? , lng = ? , lat = ?
                                        WHERE
                                            gid = ?                                    
                                    ` ).run( decrypt_payload.location , decrypt_payload.lng , decrypt_payload.lat , decrypt_payload.gid )

                                }

                                res.status( 200 ).send( {
                                    location: {
                                        pass: locationObj.pass,
                                        msg: locationObj.msg
                                    },
                                    lng: {
                                        pass: xaxisObj.pass,
                                        msg: xaxisObj.msg
                                    },
                                    lat: {
                                        pass: yaxisObj.pass,
                                        msg: yaxisObj.msg
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

                                const group_ids: string[] = decrypt_payload.gids
                                
                                group_ids.map( ( arr: string ) => {
                                    
                                    // delete the group
                                    db.prepare( `
                                        DELETE FROM
                                            groups
                                        WHERE
                                            gid = ?
                                    ` ).run( arr )
                                    
                                    const getcontactswithingroup: any = db.prepare( `
                                        SELECT
                                            group_name,
                                            group_id
                                        FROM
                                            contacts
                                        WHERE
                                            group_id = ?
                                    ` ).all( arr )
                                    
                                    // if group is exist within a contact, update the contacts
                                    if ( getcontactswithingroup.length !== 0 ) {

                                        db.prepare( `
                                            UPDATE
                                                contacts
                                            SET
                                                group_name = ?,
                                                group_id = ?
                                            WHERE
                                                group_id = ?
                                        ` ).run( '' , '' , arr )

                                    }

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
