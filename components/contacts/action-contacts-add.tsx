import { useState , useEffect } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { PlusIcon , XMarkIcon , CheckCircleIcon , ChevronDownIcon } from '@heroicons/react/20/solid'

import ActionContactsImport from './action-contacts-import'

interface Props {
    contacts_add: boolean
}

export default function ActionContactsAdd ( props: Props ): JSX.Element {

    const { contacts_add } = props

    type Classes = { display: string , opacity: string , translate: string }
    const [ classes , setClasses ] = useState <Classes> ( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-y-10' } )

    const [ tab , setTab ] = useState <string> ( 'manual' )

    type Fields = { mobile_no: string , contact_name: string , group_id: string }
    const [ fields , setFields ] = useState <Fields> ( { mobile_no: '' , contact_name: '' , group_id: '' } )

    type Warning = { mobile_no: string , contact_name: string , group_id: string }
    const [ warning , setWarning ] = useState <Warning> ( { mobile_no: '' , contact_name: '' , group_id: '' } )

    type Gids = { gid: string , name: string }
    const [ gids , setGids ] = useState <Array<Gids>> ( [] )

    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )

    const router = useRouter()

    useEffect ( () => {

        const controller = new AbortController()

        const createEncryptedPayload = new CreateEncryptedPayload()
        const generateSerial = new GenerateSerial()

        get( controller )

        async function get ( controller: any ) {

            setDisabled( true )
            setLoading( true )

            const serial: string = String( generateSerial.keyCode() )
            const encrypt: string = createEncryptedPayload.wrap( {
                serial: serial,
                command: 'groupid'
            } )

            await axios ( {
                signal: controller.signal,
                method: 'post',
                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/contacts`,
                data: { payload: encrypt },
                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
            } )
            .then ( ( res: any ) => {

                if ( res.status === 200 ) {

                    setGids( res.data )

                    setTimeout( () => {
                        setDisabled( false )
                        setLoading( false )
                    } , 500 )

                }

            } )
            .catch ( ( err: any ) => {

                if ( err ) {

                    console.error( err.message )

                    setTimeout( () => {
                        setDisabled( false )
                        setLoading( false )
                    } , 500 )

                }

            } )

        }

        return () => controller.abort()

    } , [] )

    return <>

    <div className='relative'>

        <button
            onClick={ ( e: any ) => {
                setClasses( { ... classes , display: 'flex' } )
                setTimeout( () => setClasses( { display: 'flex' , opacity: 'opacity-100' , translate: 'translate-y-0' } ) , 300 )
            } }
            type='button'
            className='bg-green-100 text-green-500 cursor-pointer outline-none p-1 rounded-full transition ease-in-out duration-300 hover:bg-green-500 hover:text-white disabled:cursor-default disabled:opacity-75 disabled:bg-gray-200 disabled:text-gray-500'
            disabled={ contacts_add ? false : true }
        >
            <PlusIcon className='h-6 w-6' />
        </button>

        <div
            onClick={ ( e: any ) => {
                /*
                    this condition will check if the click event is executed
                    to this element only with the id of "window" and 
                    not the child elements.
                */
                e.target.id === 'window' && setClasses( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-y-10' } )
            } }
            id='window' //
            className={ `fixed z-50 left-0 top-0 right-0 bottom-0 items-center justify-center h-full bg-black/25 ${ classes.display }` }
        >
            <div className={ `flex justify-center p-3 w-full transition ease-in-out duration-300 ${ classes.opacity } ${ classes.translate }` }>
                
                <div className='grid gap-5 bg-white rounded-md w-full md:w-[480px] p-3 transition-all ease-in-out duration-300'>
                    
                    <div className='flex items-center justify-between w-full'>
                        <h1 className='text-blue-600 text-lg font-open-sans-semibold capitalize'>add contacts</h1>
                        <button
                            onClick={ ( e: any ) => {
                                setClasses( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-y-10' } )
                            } }
                            type='button'
                            className='bg-red-600 border-transparent text-white border cursor-pointer outline-none rounded-full p-0.5 transition ease-in-out duration-300 hover:border-red-300'
                        >
                            <XMarkIcon className='h-3 w-3' />
                        </button>
                    </div>

                    <div className='flex'>
                        <button
                            onClick={ ( e: any ) => setTab( 'manual' ) }
                            type='button'
                            className={ `flex justify-center ${ tab === 'manual' ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white' : 'bg-gray-100 border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-300 hover:text-gray-800' } border-l border-y font-open-sans-regular text-xs uppercase cursor-pointer outline-none px-3 py-1 rounded-l transition-all ease-in-out duration-300` }
                        >
                            manual
                        </button>
                        <button
                            onClick={ ( e: any ) => setTab( 'import' ) }
                            type='button'
                            className={ `flex justify-center ${ tab === 'import' ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white' : 'bg-gray-100 border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-300 hover:text-gray-800' } border-l border-y font-open-sans-regular text-xs uppercase cursor-pointer outline-none px-3 py-1 rounded-r transition-all ease-in-out duration-300` }
                        >
                            import .csv
                        </button>
                    </div>

                    {
                            tab === 'manual'
                                ?   <form
                                        onSubmit={ async ( e: any ) => {
                                            
                                            e.preventDefault()

                                            setDisabled( true )
                                            setLoading( true )

                                            const createEncryptedPayload = new CreateEncryptedPayload()
                                            const generateSerial = new GenerateSerial()

                                            const serial: string = String( generateSerial.keyCode() )
                                            const encrypt: string = createEncryptedPayload.wrap( {
                                                serial: serial,
                                                command: 'add',
                                                ... fields
                                            } )

                                            await axios ( {
                                                method: 'post',
                                                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/contacts`,
                                                data: { payload: encrypt },
                                                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                                            } )
                                            .then ( ( res: any ) => {

                                                if ( res.status === 200 ) {

                                                    const { mobile_no , contact_name , group_id } = res.data
                
                                                    setTimeout( () => {

                                                        if ( mobile_no.pass && contact_name.pass && group_id.pass ) {

                                                            setLoading( false )

                                                            setPass( true )
                                                            setTimeout( () => router.reload() , 1000 )

                                                        } else {

                                                            setDisabled( false )
                                                            setLoading( false )

                                                            setPass( false )
                                                            setWarning( { mobile_no: mobile_no.msg , contact_name: contact_name.msg , group_id: group_id.msg } )

                                                        }

                                                    } , 500 )
                
                                                }
                                                
                                                else {
                
                                                    setTimeout( () => {

                                                        setDisabled( false )
                                                        setLoading( false )

                                                        setPass( false )
                                                        setWarning( { mobile_no: 'an error occurred.' , contact_name: 'an error occurred.' , group_id: 'an error occurred.' } )

                                                    } , 500 )
                
                                                }
                
                                            } )
                                            .catch ( ( err: any ) => {
                
                                                if ( err ) {
                                
                                                    console.error( err.message )
                                
                                                    setTimeout( () => {

                                                        setDisabled( false )
                                                        setLoading( false )

                                                        setPass( false )
                                                        setWarning( { mobile_no: 'an error occurred.' , contact_name: 'an error occurred.' , group_id: 'an error occurred.' } )

                                                    } , 500 )
                                
                                                }
                                
                                            } )
                                        
                                        } }
                                        typeof='submit'
                                        className='grid w-full'
                                    >

                                        <div className='flex flex-col space-y-1'>
                                            <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>mobile no.</label>
                                            <input
                                                type='number'
                                                onChange={ ( e: any ) => {
                                                    setFields( { ... fields , mobile_no: e.target.value } )
                                                } }
                                                className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                                id='mobile_no'
                                                placeholder='ex: 09112223333'
                                                disabled={ disabled || contacts_add ? false : true }
                                            />
                                            <div className='font-open-sans-regular text-red-500 text-right text-xs h-5'>{ warning.mobile_no }</div>
                                        </div>

                                        <div className='flex flex-col space-y-1'>
                                            <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>contact name</label>
                                            <input
                                                type='text'
                                                onChange={ ( e: any ) => {
                                                    setFields( { ... fields , contact_name: e.target.value } )
                                                } }
                                                className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                                id='contact_name'
                                                placeholder='owners nickname'
                                                disabled={ disabled || contacts_add ? false : true }
                                            />
                                            <div className='font-open-sans-regular text-red-500 text-right text-xs h-5'>{ warning.contact_name }</div>
                                        </div>

                                        <div className='flex flex-col space-y-1'>
                                            <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>group id</label>
                                            <div className='relative z-10 flex items-center w-full'>
                                                <input
                                                    type='text'
                                                    onChange={ ( e: any ) => {
                                                        setFields( { ... fields , group_id: e.target.value } )
                                                    } }
                                                    className={ `bg-transparent border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                                    name='gid'
                                                    id='gid'
                                                    autoComplete='off'
                                                    list='list'
                                                    placeholder='enter or select group id'
                                                    disabled={ disabled || contacts_add ? false : true }
                                                />
                                                <datalist id='list' >
                                                    {
                                                        gids.map( ( arr: any , ind: number ) => (
                                                            <option key={ ind } value={ arr.gid }>{ arr.name }</option>
                                                        ) )
                                                    }
                                                </datalist>
                                                <div className='absolute -z-10 right-2'>
                                                    <ChevronDownIcon className='text-blue-500 h-4 w-4' />
                                                </div>
                                            </div>
                                            <div className='font-open-sans-regular text-red-500 text-right text-xs h-5'>{ warning.group_id }</div>
                                        </div>

                                        <button
                                            type='submit'
                                            className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-xs uppercase cursor-pointer outline-none p-1 sm:w-20 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                                            disabled={ disabled || contacts_add ? false : true }
                                        >
                                            {
                                                loading
                                                    ?   <span>...</span>
                                                    :   pass
                                                            ?   <CheckCircleIcon className='h-4 w-4' />
                                                            :   'save'
                                            }
                                        </button>

                                    </form>
                        :   tab === 'import'
                                ?   <ActionContactsImport
                                        contacts_add={ contacts_add }
                                    />
                        :   <></>

                    }

                </div>

            </div>
        </div>

    </div>
    
    </>

}
