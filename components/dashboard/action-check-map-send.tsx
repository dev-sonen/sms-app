import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { PlusIcon , XMarkIcon , CheckCircleIcon , ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

interface Props {
    user: any
    groupObj: any
    fields: any
    setFields: Function
    warning: any,
    setWarning: Function
    classes: any
    setClasses: Function
    window: any
    setWindow: Function
    send_gmsg: boolean
    send_fmsg: boolean
}


export default function ActionCheckMapSend ( props: Props ): JSX.Element {

    const { user , groupObj , fields , setFields , warning , setWarning , classes , setClasses , window , setWindow , send_gmsg , send_fmsg } = props

    /* for DOM change states */
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )

    const router = useRouter()

    return <>

    <div className={ `absolute z-40 left-4 top-4 bg-white rounded shadow-black/25 shadow-md drop-shadow-md w-72 p-3 transition ease-in-out duration-300 ${ classes.display } ${ classes.opacity } ${ classes.translate }` }>

        <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-1'>
                <h1 className='text-gray-950 text-base font-open-sans-semibold'>{ groupObj.gid }</h1>
                <Link
                    href={ `https://www.google.com/maps/search/?api=1&query=${ groupObj.lat },${ groupObj.lng }` }
                    className={ `${ groupObj.lng === '' || groupObj.lat === '' ? 'text-gray-300 pointer-events-none cursor-default' : 'text-blue-600 cursor-pointer outline-none' }` }
                >
                    <ArrowTopRightOnSquareIcon className='h-4 w-4' />
                </Link>
            </div>

            <button
                onClick={ ( e: any ) => {
                    /* close window */
                    setClasses( { display: 'block' , opacity: 'opacity-0' , translate: '-translate-x-20' } )
                    setTimeout( () => setClasses( { display: 'hidden' , opacity: 'opacity-0' , translate: '-translate-x-20' } ) , 300 )
                } }     
                className='bg-red-600 text-white cursor-pointer outline-none rounded-full p-0.5 transition ease-in-out duration-300 hover:bg-red-500'
                disabled={ disabled }
            >
                <XMarkIcon className='h-3 w-3' />
            </button>
        </div>

        <p className='text-blue-600 text-xs font-open-sans-light italic truncate w-4/5'>{ groupObj.name }</p>
        <p className='text-blue-600 text-xs font-open-sans-light italic truncate w-4/5'>{ groupObj.location === '' ? '---' : groupObj.location }</p>

        <div className='my-3'></div>

        <form
            onSubmit={ async ( e: any ) => {

                e.preventDefault()

                setDisabled( true )
                setLoading( true )

                const createEncryptedPayload = new CreateEncryptedPayload()
                const generateSerial = new GenerateSerial()

                const serial: string = String( generateSerial.keyCode() )
                const encrypt: string = createEncryptedPayload.wrap( {
                    serial: serial,
                    command: 'check-map-send',
                    user: user.username,
                    gid: groupObj.gid,
                    message: fields.message.trim(),
                    flash: fields.flash
                } )

                await axios ( {
                    method: 'post',
                    url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/dashboard`,
                    data: { payload: encrypt },
                    headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                } )
                .then( ( res: any ) => {

                    if ( res.status === 200 ) {

                        const { message } = res.data

                        setTimeout( () => {

                            if ( message.pass ) {

                                setLoading( false )

                                setPass( true )
                                setTimeout( () => router.reload() , 1000 )

                            }

                            else {

                                setDisabled( false )
                                setLoading( false )

                                setPass( false )
                                setWarning( { message: message.msg } )

                            }

                        } , 500 )

                    }

                    else {

                        setTimeout( () => {

                            setDisabled( false )
                            setLoading( false )

                            setPass( false )
                            setWarning( { message: 'an error occured.' } )

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
                            setWarning( { message: 'an error occured.' } )

                        } , 500 )

                    }

                } )

            } }
            typeof='submit'
            className='grid'
        >
            <div className='grid'>
                <div className='flex items-center justify-between pb-2'>
                    <div className='flex items-center space-x-1'>
                        <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>message:</label>
                        <label className={ `bg-white ${ fields.message.length > 300 ? 'text-red-600' : 'text-gray-950' } p-0.5 rounded-sm transition ease-in-out duration-300 text-xs font-open-sans-light italic` }>{ fields.message.length }/300</label>
                    </div>
                    <button
                        onClick={ ( e: any ) => {

                            // reset warning message.
                            setWarning( { ... warning , message: '' } )

                            setWindow( { ... window , template: { display: 'flex' , opacity: 'opacity-0' , translate: 'translate-x-10' } } )
                            setTimeout( () => setWindow( { ... window , template: { display: 'flex' , opacity: 'opacity-100' , translate: 'translate-x-0' } } ) , 300 )
                        
                        } }
                        type='button'
                        className='text-gray-950 cursor-pointer outline-none rounded-full p-0.5 disabled:cursor-default disabled:opacity-75'
                        disabled={ disabled || send_gmsg ? false : true }
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
                    value={ fields.message }
                    placeholder='...'
                    disabled={ disabled || send_gmsg ? false : true }
                />

                <div className='flex items-center justify-start min-h-5 my-1'>
                    <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.message }</div>
                </div>
            </div>

            <div className='flex items-center space-x-1 mb-5'>
                <input
                    type='checkbox'
                    onChange={ ( e: any ) => setFields( { ... fields , flash: e.target.checked } ) }
                    className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                    disabled={ disabled || send_fmsg ? false : true }
                />
                <label className='text-gray-950 text-xs font-open-sans-light uppercase'>enable flash message</label>
            </div>

            <button
                type='submit'

                className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-xs uppercase cursor-pointer outline-none p-1 w-full rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                disabled={ disabled || send_gmsg ? false : true }
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

    </div>
    
    </>

}
