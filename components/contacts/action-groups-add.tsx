import { useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { PlusIcon , XMarkIcon , CheckCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    groups_add: boolean
}

export default function ActionGroupsAdd ( props: Props ): JSX.Element {

    const { groups_add } = props

    type Classes = { display: string , opacity: string , translate: string }
    const [ classes , setClasses ] = useState <Classes> ( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-y-10' } )

    type Fields = { group_id: string , group_name: string , location: string , lng: string , lat: string }
    const [ fields , setFields ] = useState <Fields> ( { group_id: '' , group_name: '' , location: '' , lng: '' , lat: '' } )

    type Warning = { group_name: string , location: string , lng: string , lat: string }
    const [ warning , setWarning ] = useState <Warning> ( { group_name: '' , location: '' , lng: '' , lat: '' } )

    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )

    /*
        generate groupid function.
        
        format: first 1 to 4 characters of the group name + 4 random number between 0000 to 9999 + 4 random letters
    */
    const groupid = ( value: string ): string => {
        const generateNumeric = new GenerateSerial( { setof: 'numeric' } )
        const generateAlpha = new GenerateSerial( { setof: 'alphaupp' } )
        return String( value.replace( /\s/g , '' ).substring( 0 , 4 ).toUpperCase() + generateNumeric.keyCode( { length: 4 } ) + generateAlpha.keyCode( { length: 4 } ) )
    }

    const router = useRouter()

    return <>

    <div className='relative'>

        <button
            onClick={ ( e: any ) => {
                setClasses( { ... classes , display: 'flex' } )
                setTimeout( () => setClasses( { display: 'flex' , opacity: 'opacity-100' , translate: 'translate-y-0' } ) , 300 )
            } }
            type='button'
            className='bg-green-100 text-green-500 cursor-pointer outline-none p-1 rounded-full transition ease-in-out duration-300 hover:bg-green-500 hover:text-white disabled:cursor-default disabled:opacity-75 disabled:bg-gray-200 disabled:text-gray-500'
            disabled={ groups_add ? false : true }
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
                
                <div className='grid gap-5 bg-white rounded-md w-full sm:w-[360px] p-5 transition-all ease-in-out duration-300'>
                    
                    <div className='flex items-center justify-between w-full'>
                        <h1 className='text-blue-600 text-lg font-open-sans-semibold capitalize'>add group</h1>
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
                                command: 'add',
                                ... fields
                            } )

                            await axios ( {
                                method: 'post',
                                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/groups`,
                                data: { payload: encrypt },
                                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                            } )
                            .then ( ( res: any ) => {

                                if ( res.status === 200 ) {

                                    const { group_name , location , lng , lat } = res.data

                                    setTimeout( () => {

                                        if ( group_name.pass && location.pass && lng.pass && lat.pass ) {

                                            setLoading( false )

                                            setPass( true )
                                            setTimeout( () => router.reload() , 1000 )

                                        } else {

                                            setDisabled( false )
                                            setLoading( false )

                                            setPass( false )
                                            setWarning( { group_name: group_name.msg , location: location.msg , lng: lng.msg , lat: lat.msg } )

                                        }

                                    } , 500 )

                                }
                                
                                else {

                                    setTimeout( () => {

                                        setDisabled( false )
                                        setLoading( false )

                                        setPass( false )
                                        setWarning( { group_name: 'an error occurred.' , location: 'an error occurred.' , lng: 'an error occurred.' , lat: 'an error occurred.' } )

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
                                        setWarning( { group_name: 'an error occurred.' , location: 'an error occurred.' , lng: 'an error occurred.' , lat: 'an error occurred.' } )

                                    } , 500 )
                
                                }
                
                            } )

                        } }
                        typeof='submit'
                        className='grid'
                    >

                        <div className='flex flex-col space-y-1'>
                            <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>group name <span className='text-blue-500 italic'>&#91;{ fields.group_id }&#93;</span></label>
                            <input
                                type='text'
                                onChange={ ( e: any ) => {
                                    setFields( { ... fields , group_id: groupid( e.target.value ) , group_name: e.target.value.trim() } )
                                } }
                                className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                id='group_name'
                                placeholder='enter group name'
                                disabled={ disabled || groups_add ? false : true }
                            />
                            <div className='font-open-sans-regular text-red-500 text-xs h-5'>{ warning.group_name }</div>
                        </div>

                        <div className='flex flex-col space-y-1'>
                            <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>location</label>
                            <input
                                type='text'
                                onChange={ ( e: any ) => {
                                    setFields( { ... fields , location: e.target.value.trim() } )
                                } }
                                className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                id='location'
                                placeholder='optional'
                                disabled={ disabled || groups_add ? false : true }
                            />
                            <div className='font-open-sans-regular text-red-500 text-xs h-5'>{ warning.location }</div>
                        </div>

                        <div className='grid sm:grid-cols-2 sm:gap-4'>
                            <div className='flex flex-col space-y-1'>
                                <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>longitude</label>
                                <input
                                    type='number'
                                    onChange={ ( e: any ) => {
                                        setFields( { ... fields , lng: e.target.value.trim() } )
                                    } }
                                    className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                    id='lng'
                                    step='any'
                                    placeholder='optional'
                                    disabled={ disabled || groups_add ? false : true }
                                />
                                <div className='font-open-sans-regular text-red-500 text-xs h-5'>{ warning.lng }</div>
                            </div>
                            <div className='flex flex-col space-y-1'>
                                <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>latitude</label>
                                <input
                                    type='number'
                                    onChange={ ( e: any ) => {
                                        setFields( { ... fields , lat: e.target.value.trim() } )
                                    } }
                                    className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                    id='lat'
                                    step='any'
                                    placeholder='optional'
                                    disabled={ disabled || groups_add ? false : true }
                                />
                                <div className='font-open-sans-regular text-red-500 text-xs h-5'>{ warning.lat }</div>
                            </div>
                        </div>

                        <button
                            type='submit'
                            className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none p-1 w-full rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                            disabled={ disabled || groups_add ? false : true }
                        >
                            {
                                loading
                                    ?   <span>...</span>
                                    :   pass
                                            ?   <CheckCircleIcon className='h-5 w-5' />
                                            :   'save'
                            }
                        </button>

                    </form>

                </div>

            </div>
        </div>

    </div>
    
    </>

}
