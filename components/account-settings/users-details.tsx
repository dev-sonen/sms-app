import { useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import swal from 'sweetalert'

import { CheckCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    obj: any | { account: string , username: string , name: string , image: string }
    disabled: boolean
}

export default function UsersDetails ( props: Props ): JSX.Element {

    const { obj , disabled } = props

    type Fields = {
        send: {
            normal: number,
            flash: number,
            group: number,
            scheduled: number
        },
        inbox: {
            read: number,
            delete: number
        },
        contacts: {
            add: number,
            edit: number,
            delete: number
        },
        groups: {
            add: number,
            edit: number,
            delete: number
        },
        template: {
            create: number,            
            edit: number,
            delete: number
        },
        sent: {
            delete: number
        },
        queue: {
            delete: number
        },
        failed: {
            delete: number
        }
    }
    const [ fields , setFields ] = useState <Fields> ( {
        send: {
            normal: obj.send_nmsg,
            flash: obj.send_fmsg,
            group: obj.send_gmsg,
            scheduled: obj.send_smsg
        },
        inbox: {
            read: obj.inbox_read,
            delete: obj.inbox_del
        },
        contacts: {
            add: obj.contacts_add,
            edit: obj.contacts_edit,
            delete: obj.contacts_del
        },
        groups: {
            add: obj.groups_add,
            edit: obj.groups_edit,
            delete: obj.groups_del
        },
        template: {
            create: obj.template_create,            
            edit: obj.template_edit,
            delete: obj.template_del
        },
        sent: {
            delete: obj.sent_del
        },
        queue: {
            delete: obj.queue_del
        },
        failed: {
            delete: obj.failed_del
        }
    } )

    const [ selfdis , setSelfdis ] = useState <boolean> ( false )
    const [ selfloa , setSelfloa ] = useState <boolean> ( false )
    const [ selfpas , setSelfpas ] = useState <boolean> ( false )

    const router = useRouter()

    return <>

    <td scope='row' colSpan={ 3 } className='bg-gray-50 p-2'>
        
        <div className='block'>

            <h1 className='text-gray-950 text-base font-open-sans-medium uppercase'>set account privileges</h1>

            <div className='my-2'></div>

            <form
                onSubmit={ async ( e: any ) => {

                    e.preventDefault()

                    setSelfdis( true )
                    setSelfloa( true )

                    const createEncryptedPayload = new CreateEncryptedPayload()
                    const generateSerial = new GenerateSerial()

                    const serial: string = String( generateSerial.keyCode() )
                    const encrypt: string = createEncryptedPayload.wrap( {
                        serial: serial,
                        role: 'admin',
                        command: 'change',
                        account: obj.account,
                        sets: fields
                    } )

                    await axios ( {
                        method: 'post',
                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/account-settings-privileges`,
                        data: { payload: encrypt },
                        headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                    } )
                    .then ( ( res: any ) => {

                        setSelfloa( false )
                        setSelfpas( true )
                        
                        swal( {
                            title: 'priveleges updated!',
                            text: '',
                            icon: 'success'
                        } )
                        .then ( ok => {

                            router.reload()

                        } )

                    } )
                    .catch( ( err: any ) => {

                        if ( err ) {

                            console.error( err.message )

                            setSelfdis( false )
                            setSelfloa( false )

                            swal ( {
                                title: '',
                                text: `an error occured.`,
                                icon: 'warning',
                                dangerMode: true,
                            } )

                        }

                    } )

                } }
                typeof='submit'
                className='block'
            >
                <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
                    <div className='flex flex-col space-y-2'>
                        <div className='text-blue-600 font-open-sans-medium uppercase'>send message</div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , send: { ... fields.send , normal: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='normal_msg'
                                defaultChecked={ fields.send.normal === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='normal_msg' className='font-open-sans-light uppercase'>normal</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , send: { ... fields.send , flash: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='flash_msg'
                                defaultChecked={ fields.send.flash === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='flash_msg' className='font-open-sans-light uppercase'>flash</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , send: { ... fields.send , group: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='group_msg'
                                defaultChecked={ fields.send.group === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='group_msg' className='font-open-sans-light uppercase'>group</label>
                        </div>
                        { /* className='flex items-center space-x-1' */ }
                        {/* <div className='hidden items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , send: { ... fields.send , scheduled: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='scheduled_msg'
                                defaultChecked={ fields.send.scheduled === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='scheduled_msg' className='font-open-sans-light uppercase'>scheduled</label>
                        </div> */}
                    </div>

                    <div className='flex flex-col space-y-2'>
                        <div className='text-blue-600 font-open-sans-medium uppercase'>inbox</div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , inbox: { ... fields.inbox , read: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='inbox_read'
                                defaultChecked={ fields.inbox.read === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='inbox_read' className='font-open-sans-light uppercase'>read</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , inbox: { ... fields.inbox , delete: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='inbox_delete'
                                defaultChecked={ fields.inbox.delete === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='inbox_delete' className='font-open-sans-light uppercase'>delete</label>
                        </div>
                    </div>

                    <div className='flex flex-col space-y-2'>
                        <div className='text-blue-600 font-open-sans-medium uppercase'>contacts</div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , contacts: { ... fields.contacts , add: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='contacts_add'
                                defaultChecked={ fields.contacts.add === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='contacts_add' className='font-open-sans-light uppercase'>add</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , contacts: { ... fields.contacts , edit: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='contacts_edit'
                                defaultChecked={ fields.contacts.edit === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='contacts_edit' className='font-open-sans-light uppercase'>edit</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , contacts: { ... fields.contacts , delete: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='contacts_delete'
                                defaultChecked={ fields.contacts.delete === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='contacts_delete' className='font-open-sans-light uppercase'>delete</label>
                        </div>
                    </div>

                    <div className='flex flex-col space-y-2'>
                        <div className='text-blue-600 font-open-sans-medium uppercase'>groups</div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , groups: { ... fields.groups , add: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='group_add'
                                defaultChecked={ fields.groups.add === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='group_add' className='font-open-sans-light uppercase'>add</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , groups: { ... fields.groups , edit: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='group_edit'
                                defaultChecked={ fields.groups.edit === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='group_edit' className='font-open-sans-light uppercase'>edit</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , groups: { ... fields.groups , delete: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='group_delete'
                                defaultChecked={ fields.groups.delete === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='group_delete' className='font-open-sans-light uppercase'>delete</label>
                        </div>
                    </div>

                    <div className='flex flex-col space-y-2'>
                        <div className='text-blue-600 font-open-sans-medium uppercase'>template</div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , template: { ... fields.template , create: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='template_create'
                                defaultChecked={ fields.template.create === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='template_create' className='font-open-sans-light uppercase'>create</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , template: { ... fields.template , edit: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='template_edit'
                                defaultChecked={ fields.template.edit === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='template_edit' className='font-open-sans-light uppercase'>edit</label>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , template: { ... fields.template , delete: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='template_delete'
                                defaultChecked={ fields.template.delete === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='template_delete' className='font-open-sans-light uppercase'>delete</label>
                        </div>
                    </div>

                    <div className='flex flex-col space-y-2'>
                        <div className='text-blue-600 font-open-sans-medium uppercase'>sent</div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , sent: { delete: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='sent_delete'
                                defaultChecked={ fields.sent.delete === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='sent_delete' className='font-open-sans-light uppercase'>delete</label>
                        </div>
                    </div>

                    <div className='flex flex-col space-y-2'>
                        <div className='text-blue-600 font-open-sans-medium uppercase'>queue</div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , queue: { delete: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='queue_delete'
                                defaultChecked={ fields.queue.delete === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='queue_delete' className='font-open-sans-light uppercase'>delete</label>
                        </div>
                    </div>

                    {/* <div className='flex flex-col space-y-2'>
                        <div className='text-blue-600 font-open-sans-medium uppercase'>failed</div>
                        <div className='flex items-center space-x-1'>
                            <input
                                type='checkbox'
                                onChange={ ( e: any ) => setFields( { ... fields , failed: { delete: e.target.checked ? 1 : 0 } } ) }
                                className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                id='failed_delete'
                                defaultChecked={ fields.failed.delete === 1 ? true : false }
                                disabled={ disabled || selfdis }
                            />
                            <label htmlFor='failed_delete' className='font-open-sans-light uppercase'>delete</label>
                        </div>
                    </div> */}
                </div>

                <div className='my-5'></div>

                <div className='flex justify-start'>
                    <button
                        type='submit'
                        className={ `${ selfpas ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none p-1 w-40 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                        disabled={ disabled }
                    >
                        {
                            selfloa
                                ?   <span>...</span>
                                :   selfpas
                                        ?   <CheckCircleIcon className='h-5 w-5' />
                                        :   'save changes'
                        }
                    </button>
                </div>

            </form>

        </div>

    </td>

    </>

}
