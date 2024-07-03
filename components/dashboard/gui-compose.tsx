import { useState , useRef } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import ActionComposeAddContacts from './action-compose-add-contacts'
import ActionComposeAddTemplate from './action-compose-add-template'

import { ArrowsRightLeftIcon , PlusIcon , CheckCircleIcon } from '@heroicons/react/20/solid'
import ActionComposeAddGroups from './action-compose-add-groups'

interface Props {
    user: any
    query: any
    priviledges: any
}

export default function GuiCompose ( props: Props ): JSX.Element {

    const {
        user,
        query,
        priviledges: { priviledges: { send_nmsg , send_fmsg , send_gmsg } }
    } = props

    /*
        reply query "/dashboard?token=query_token&contact=reply_contact"
        see: list-inbox.tsx
    */
    const contact: string = query.contact === undefined ? '' : query.contact

    type Classes = {
        contact: {
            display: string,
            opacity: string,
            translate: string
        },
        groups: {
            display: string,
            opacity: string,
            translate: string
        },
        template: {
            display: string,
            opacity: string,
            translate: string
        }
    }

    const [ classes , setClasses ] = useState <Classes> ( {
        contact: {
            display: 'hidden',
            opacity: 'opacity-0',
            translate: 'translate-x-10'
        },
        groups: {
            display: 'hidden',
            opacity: 'opacity-0',
            translate: 'translate-x-10'
        },
        template: {
            display: 'hidden',
            opacity: 'opacity-0',
            translate: 'translate-x-10'
        } 
    } )

    type Fields = { contactno: string , message: string , flash: boolean }
    const [ fields , setFields ] = useState <Fields> ( { contactno: contact , message: '' , flash: false } )

    type Warning = { contactno: string , message: string }
    const [ warning , setWarning ] = useState <Warning> ( { contactno: '' , message: '' } )

    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )

    /* switch between add contacts and add groups */
    const [ toggle , setToggle ] = useState <boolean> ( false )

    /* ref for contactno field, this will apply once switch is toggled. */
    const refContact = useRef <any> ( null )

    const router = useRouter()

    return <>
    
    <div className='grid p-5 gap-3 md:p-10'>

        <form
            onSubmit={ async ( e: any ) => {

                e.preventDefault()

                const contacts: string[] = fields.contactno.split( ',' )
                const message: string = fields.message.trim()
                const flash: boolean = fields.flash

                setDisabled( true )
                setLoading( true )

                const createEncryptedPayload = new CreateEncryptedPayload()
                const generateSerial = new GenerateSerial()

                const serial: string = String( generateSerial.keyCode() )
                const encrypt: string = createEncryptedPayload.wrap( {
                    serial: serial,
                    command: 'send',
                    type: toggle ? 'group' : 'single',
                    user: user.username,
                    contacts: contacts,
                    message: message,
                    flash: flash,

                } )

                await axios ( {
                    method: 'post',
                    url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/dashboard`,
                    data: { payload: encrypt },
                    headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                } )
                .then( ( res: any ) => {

                    if ( res.status === 200 ) {

                        const { contactno , message } = res.data

                        setTimeout( () => {

                            if ( contactno.pass && message.pass ) {

                                setLoading( false )

                                setPass( true )
                                setTimeout( () => router.reload() , 1000 )

                            }

                            else {

                                setDisabled( false )
                                setLoading( false )
    
                                setPass( false )
                                setWarning( { contactno: contactno.msg , message: message.msg } )

                            }

                        } , 500 )

                    }

                    else {

                        setTimeout( () => {

                            setDisabled( false )
                            setLoading( false )

                            setPass( false )
                            setWarning( { contactno: 'an error occured.' , message: 'an error occured.' } )

                        } , 500 )

                    }

                } )
                .catch( ( err: any ) => {

                    if ( err ) {

                        console.error( err.message )

                        setTimeout( () => {

                            setDisabled( false )
                            setLoading( false )

                            setPass( false )
                            setWarning( { contactno: 'an error occured.' , message: 'an error occured.' } )

                        } , 500 )

                    }

                } )

            } }
            typeof='submit'
            className='grid gap-2 w-full md:w-96'
        >

            <div className='grid'>
                <div className='flex items-center justify-between pb-2'>
                    <div className='flex items-center space-x-1'>
                        <button
                            onClick={ ( e: any ) => {

                                // reset value of state once toggled.
                                setFields( { ... fields , contactno: '' } )
                                refContact.current.value = ''

                                // reset the warning message.
                                setWarning( { contactno: '' , message: '' } )

                                setToggle( !toggle )

                            } }
                            type='button'
                            className='text-gray-950 cursor-pointer outline-none rounded-full p-0.5 disabled:cursor-default disabled:opacity-75'
                            disabled={ disabled || send_gmsg ? false : true }
                        >
                            <ArrowsRightLeftIcon className='h-4 w-4' />
                        </button>
                        {
                            toggle
                                ?   <label htmlFor='mobile_no' className='bg-teal-400 text-white text-xs font-open-sans-medium uppercase rounded-full py-0.5 px-2'>group id.</label>
                                :   <label htmlFor='mobile_no' className='bg-sky-400 text-white text-xs font-open-sans-medium uppercase rounded-full py-0.5 px-2'>mobile no.</label>
                        }
                    </div>
                    <button
                        onClick={ ( e: any ) => {

                            // reset warning message.
                            setWarning( { ... warning , contactno: '' } )

                            // toggle for groups
                            if ( toggle ) {
                                setClasses( { ... classes , groups: { display: 'flex' , opacity: 'opacity-0' , translate: 'translate-x-10' } } )
                                setTimeout( () => setClasses( { ... classes , groups: { display: 'flex' , opacity: 'opacity-100' , translate: 'translate-x-0' } } ) , 300 )
                            }

                            // toggle for mobile no.
                            else {
                                setClasses( { ... classes , contact: { display: 'flex' , opacity: 'opacity-0' , translate: 'translate-x-10' } } )
                                setTimeout( () => setClasses( { ... classes , contact: { display: 'flex' , opacity: 'opacity-100' , translate: 'translate-x-0' } } ) , 300 )
                            }

                        } }
                        type='button'
                        className='text-gray-950 cursor-pointer outline-none rounded-full p-0.5 disabled:cursor-default disabled:opacity-75'
                        disabled={ disabled || send_nmsg ? false : true }
                    >
                        <PlusIcon className='h-4 w-4' />
                    </button>
                </div>
                
                <input
                    ref={ refContact }
                    onChange={ ( e: any ) => {
                        setFields( { ... fields , contactno: e.target.value } )
                        setWarning( { ... warning , contactno: ''} )
                    } }
                    type='text'
                    className='bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded p-1 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100'
                    id='mobile_no'
                    value={ fields.contactno }
                    placeholder={ toggle ? 'ex: GROU1234ABCD' : 'ex: 09271234567,09267654321' }
                    disabled={ disabled || send_nmsg ? false : true }
                />

                <div className='flex items-center justify-start h-5'>
                    <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.contactno }</div>
                </div>
            </div>
                    
            <div className='grid'>
                <div className='flex items-center justify-between pb-2'>
                    <div className='flex items-center space-x-1'>
                        <label htmlFor='message' className='text-gray-950 text-xs font-open-sans-medium uppercase'>message:</label>
                        <label className={ `bg-white ${ fields.message.length > 300 ? 'text-red-600' : 'text-gray-950' } p-0.5 rounded-sm transition ease-in-out duration-300 text-xs font-open-sans-light italic` }>{ fields.message.length }/300</label>
                    </div>
                    <button
                        onClick={ ( e: any ) => {

                            // reset warning message.
                            setWarning( { ... warning , message: '' } )

                            setClasses( { ... classes , template: { display: 'flex' , opacity: 'opacity-0' , translate: 'translate-x-10' } } )
                            setTimeout( () => setClasses( { ... classes , template: { display: 'flex' , opacity: 'opacity-100' , translate: 'translate-x-0' } } ) , 300 )
                        
                        } }
                        type='button'
                        className='text-gray-950 cursor-pointer outline-none rounded-full p-0.5 disabled:cursor-default disabled:opacity-75'
                        disabled={ disabled || send_nmsg ? false : true }
                    >
                        <PlusIcon className='h-4 w-4' />
                    </button>
                </div>

                <textarea
                    onChange={ ( e: any ) => {
                        setFields( { ... fields , message: e.target.value } )
                        setWarning( { ... warning , message: '' } )
                    } }
                    className='bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none resize-none rounded p-1 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100'
                    rows={ 6 }
                    id='message'
                    value={ fields.message }
                    placeholder='...'
                    disabled={ disabled || send_nmsg ? false : true }
                />

                <div className='flex items-center justify-start h-5'>
                    <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.message }</div>
                </div>
            </div>

            <div className='flex items-center space-x-1 pb-5'>
                <input
                    type='checkbox'
                    onChange={ ( e: any ) => setFields( { ... fields , flash: e.target.checked } ) }
                    className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                    id='flash_msg'
                    disabled={ disabled || send_fmsg ? false : true }
                />
                <label htmlFor='normal_msg' className='text-gray-950 text-xs font-open-sans-light uppercase'>enable flash message</label>
            </div>

            <button
                type='submit'
                className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-xs uppercase cursor-pointer outline-none p-1 w-full sm:w-32 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                disabled={ disabled || send_nmsg ? false : true }
            >
                {
                    loading
                        ?   <span>...</span>
                        :   pass
                                ?   <div className='flex items-center space-x-0.5'>
                                        <span>msg sent</span>
                                        <CheckCircleIcon className='h-4 w-4' />
                                    </div>
                                :   'send'
                }
            </button>

        </form>

        {
            toggle
                ?   <ActionComposeAddGroups
                        query={ query }
                        fields={ fields }
                        setFields={ setFields }
                        classes={ classes }
                        setClasses={ setClasses }
                    />
                :   <ActionComposeAddContacts
                        query={ query }
                        fields={ fields }
                        setFields={ setFields }
                        classes={ classes }
                        setClasses={ setClasses }
                    />
        }

        <ActionComposeAddTemplate
            query={ query }
            fields={ fields }
            setFields={ setFields }
            classes={ classes }
            setClasses={ setClasses }
        />

    </div>
    
    </>

}
