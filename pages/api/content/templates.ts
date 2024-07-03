import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'
import Paginate from '@/classes/paginate'

import validator from 'validator'

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

                                const { title , content , color } =  decrypt_payload

                                const validateTitle = (): any | void => {

                                    if ( title === '' ) {
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: ''
                                        }
                                    }
                                    
                                    const validate_title = validator.isAlphanumeric( title , 'en-US' , { ignore: ' .,-_?!@#%&()/$' } )

                                    if ( validate_title ) {
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: title
                                        }
                                    }

                                    return {
                                        pass: false,
                                        msg: 'invalid characters ~`^*+={}[]|\\:;"\'<> for title.',
                                        value: null
                                    }


                                }

                                const validateContent = (): any | void => {

                                    if ( content === '' ) {
                                        return {
                                            pass: false,
                                            msg: 'empty content.',
                                            value: ''
                                        }
                                    }

                                    const validate_content = validator.isAlphanumeric( content , 'en-US' , { ignore: ' .,-_?!@#%&()/$' } )
                                    const check_length = content.length

                                    if ( check_length > 300 ) {
                                        return {
                                            pass: false,
                                            msg: 'content must not exceed 160 characters.',
                                            value: null
                                        }
                                    }

                                    if ( validate_content && check_length <= 300 ) {
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: content
                                        }
                                    }

                                    return {
                                        pass: false,
                                        msg: 'invalid characters ~`^*+={}[]|\\:;"\'<> for content.',
                                        value: null
                                    }

                                }

                                const titleObj = validateTitle()
                                const contentObj = validateContent()

                                if ( titleObj.pass && contentObj.pass ) {

                                    const tid = new GenerateSerial( { setof: 'alphanumericall' } ).keyCode( { length: 32 } )

                                    db.prepare( `
                                        INSERT INTO
                                            templates
                                            ( tid , title , content , color )
                                        VALUES
                                            ( ? , ? , ? , ? )
                                    ` ).run( tid , titleObj.value , contentObj.value , color )

                                }

                                res.status( 200 ).send( {
                                    title: {
                                        pass: titleObj.pass,
                                        msg: titleObj.msg
                                    },
                                    content: {
                                        pass: contentObj.pass,
                                        msg: contentObj.msg
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

                                const { title , content , tid } =  decrypt_payload

                                const validateTitle = (): any | void => {

                                    if ( title === '' ) {
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: ''
                                        }
                                    }
                                    
                                    const validate_title = validator.isAlphanumeric( title , 'en-US' , { ignore: ' .,-_?!@#%&()/$' } )

                                    if ( validate_title ) {
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: title
                                        }
                                    }

                                    return {
                                        pass: false,
                                        msg: 'invalid characters ~`^*+={}[]|\\:;"\'<> for title.',
                                        value: null
                                    }


                                }

                                const validateContent = (): any | void => {

                                    if ( content === '' ) {
                                        return {
                                            pass: false,
                                            msg: 'empty content.',
                                            value: ''
                                        }
                                    }

                                    const validate_content = validator.isAlphanumeric( content , 'en-US' , { ignore: ' .,-_?!@#%&()/$' } )
                                    const check_length = content.length

                                    if ( check_length > 300 ) {
                                        return {
                                            pass: false,
                                            msg: 'content must not exceed 300 characters.',
                                            value: null
                                        }
                                    }

                                    if ( validate_content && check_length <= 300 ) {
                                        return {
                                            pass: true,
                                            msg: '',
                                            value: content
                                        }
                                    }

                                    return {
                                        pass: false,
                                        msg: 'invalid characters ~`^*+={}[]|\\:;"\'<> for content.',
                                        value: null
                                    }

                                }

                                const titleObj = validateTitle()
                                const contentObj = validateContent()

                                if ( titleObj.pass && contentObj.pass ) {

                                    db.prepare( `
                                        UPDATE
                                            templates
                                        SET
                                            title = ?,
                                            content = ?
                                        WHERE
                                            tid = ?
                                    ` ).run( titleObj.value , contentObj.value , tid )

                                }

                                res.status( 200 ).send( {
                                    title: {
                                        pass: titleObj.pass,
                                        msg: titleObj.msg
                                    },
                                    content: {
                                        pass: contentObj.pass,
                                        msg: contentObj.msg
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

                                const { tid } =  decrypt_payload

                                db.prepare( `
                                    DELETE FROM
                                        templates
                                    WHERE
                                        tid = ?
                                ` ).run( tid )

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
