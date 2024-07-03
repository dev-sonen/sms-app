import fs from 'fs'

import type { NextApiRequest , NextApiResponse } from 'next'

import { db } from '@/config/sqlite.config'

import CreateEncryptedPayload from '@/classes/create-encrypted-payload'

// account-settings/privileges.tsx
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

                if ( decrypt_header === decrypt_payload.serial && decrypt_payload.role === 'admin' ) {

                    switch ( decrypt_payload.command ) {

                        default:
                            res.status( 405 ).send( 'Method Not Allowed' )
                        break

                        case 'search':

                            try {

                                const users: any = db.prepare( `
                                    SELECT
                                        users.account,
                                        users.username,
                                        users.role,
                                        users.name,
                                        users.image,
                                        priveledges_send.send_nmsg,
                                        priveledges_send.send_fmsg,
                                        priveledges_send.send_gmsg,
                                        priveledges_send.send_smsg,
                                        priveledges_inbox.inbox_read,
                                        priveledges_inbox.inbox_del,
                                        priveledges_contacts.contacts_add,
                                        priveledges_contacts.contacts_edit,
                                        priveledges_contacts.contacts_del,
                                        priveledges_groups.groups_add,
                                        priveledges_groups.groups_edit,
                                        priveledges_groups.groups_del,
                                        priveledges_template.template_create,
                                        priveledges_template.template_edit,
                                        priveledges_template.template_del,
                                        priveledges_sent.sent_del,
                                        priveledges_queue.queue_del,
                                        priveledges_failed.failed_del
                                    FROM
                                        priveledges_send,
                                        priveledges_inbox,
                                        priveledges_contacts,
                                        priveledges_groups,
                                        priveledges_template,
                                        priveledges_sent,
                                        priveledges_queue,
                                        priveledges_failed
                                    RIGHT JOIN
                                        users
                                    ON
                                        users.account = priveledges_send.account AND
                                        users.account = priveledges_inbox.account AND
                                        users.account = priveledges_contacts.account AND
                                        users.account = priveledges_groups.account AND
                                        users.account = priveledges_template.account AND
                                        users.account = priveledges_sent.account AND
                                        users.account = priveledges_queue.account AND
                                        users.account = priveledges_failed.account
                                    WHERE
                                        users.role = ?
                                    AND
                                        ( users.username LIKE ? OR users.account LIKE ? )
                                ` ).all( 'user' , `${ decrypt_payload.search }%` , `${ decrypt_payload.search }%` )
        
                            res.status( 200 ).send( users )

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }

                            }

                        break

                        case 'delete':

                            try {

                                /*
                                    this will also remove all the uploaded files
                                    for that contacts.
                                */
                                    
                                // find the recorded file "name"
                                const getfilename: any = db.prepare( `SELECT image FROM users WHERE account = ?` ).get( decrypt_payload.account )

                                // check if the file "name" is existed then delete the existing file.
                                if ( getfilename.image !== '' ) {
                                    fs.rmSync( `../media-server/public/content/${ decrypt_payload.account }` , { recursive: true , force: true } )
                                }

                                db.prepare( `DELETE FROM users WHERE account = ?` ).run( decrypt_payload.account )
                                db.prepare( `DELETE FROM priveledges_send WHERE account = ?` ).run( decrypt_payload.account )
                                db.prepare( `DELETE FROM priveledges_inbox WHERE account = ?` ).run( decrypt_payload.account )
                                db.prepare( `DELETE FROM priveledges_contacts WHERE account = ?` ).run( decrypt_payload.account )
                                db.prepare( `DELETE FROM priveledges_groups WHERE account = ?` ).run( decrypt_payload.account )
                                db.prepare( `DELETE FROM priveledges_template WHERE account = ?` ).run( decrypt_payload.account )
                                db.prepare( `DELETE FROM priveledges_sent WHERE account = ?` ).run( decrypt_payload.account )
                                db.prepare( `DELETE FROM priveledges_queue WHERE account = ?` ).run( decrypt_payload.account )
                                db.prepare( `DELETE FROM priveledges_failed WHERE account = ?` ).run( decrypt_payload.account )
                                
                                res.end()

                            } catch ( err ) {

                                if ( err ) {
                                    console.log( err )
                                    res.status( 500 ).send( 'Internal Server Error' )
                                }
                            
                            }

                        break

                        case 'change':

                            try {

                                const { sets: { send , inbox , contacts , groups , template , sent , queue , failed } , account } = decrypt_payload

                                db.prepare( `
                                    UPDATE
                                        priveledges_send
                                    SET
                                        send_nmsg = ?,
                                        send_fmsg = ?,
                                        send_gmsg = ?,
                                        send_smsg = ?
                                    WHERE
                                        account = ?
                                ` ).run( send.normal , send.flash , send.group , send.scheduled , account )
                                
                                db.prepare( `
                                    UPDATE
                                        priveledges_inbox
                                    SET
                                        inbox_read = ?,
                                        inbox_del = ?
                                    WHERE
                                        account = ?
                                ` ).run( inbox.read , inbox.delete , account )
                                
                                db.prepare( `
                                    UPDATE
                                        priveledges_contacts
                                    SET
                                        contacts_add = ?,
                                        contacts_edit = ?,
                                        contacts_del = ?
                                    WHERE
                                        account = ?
                                ` ).run( contacts.add , contacts.edit , contacts.delete , account )
                                
                                db.prepare( `
                                    UPDATE
                                        priveledges_groups
                                    SET
                                        groups_add = ?,
                                        groups_edit = ?,
                                        groups_del = ?
                                    WHERE
                                        account = ?
                                ` ).run( groups.add , groups.edit , groups.delete , account )

                                db.prepare( `
                                    UPDATE
                                        priveledges_template
                                    SET
                                        template_create = ?,
                                        template_edit = ?,
                                        template_del = ?
                                    WHERE
                                        account = ?
                                ` ).run( template.create , template.edit , template.delete , account )

                                db.prepare( `
                                    UPDATE
                                        priveledges_sent
                                    SET
                                        sent_del = ?
                                    WHERE
                                        account = ?
                                ` ).run( sent.delete , account )

                                db.prepare( `
                                    UPDATE
                                        priveledges_queue
                                    SET
                                        queue_del = ?
                                    WHERE
                                        account = ?
                                ` ).run( queue.delete , account )

                                db.prepare( `
                                    UPDATE
                                        priveledges_failed
                                    SET
                                        failed_del = ?
                                    WHERE
                                        account = ?
                                ` ).run( failed.delete , account )

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
