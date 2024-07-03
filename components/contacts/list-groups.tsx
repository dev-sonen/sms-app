import { useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { ArrowTopRightOnSquareIcon , BarsArrowDownIcon , BarsArrowUpIcon , CheckCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    disabled: boolean
    obj: any
    one: any                // for checkbox.
    all: any                // for checkbox.
    groups_edit: boolean
    setMenu: Function       // enable and disabled "menu" state.
}

export default function ListGroups ( props: Props ): JSX.Element {

    const {
        disabled,
        obj,
        one,
        all,
        groups_edit,
        setMenu
    } = props

    type Fields = { gid: string , location: string , lng: string , lat: string }
    const [ fields , setFields ] = useState <Fields> ( { gid: '' , location: '' , lng: '' , lat: '' } )

    type Warning = { location: string , lng: string , lat: string }
    const [ warning , setWarning ] = useState <Warning> ( { location: '' , lng: '' , lat: '' } )

    const [ selfDis , setSelfDis ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )
    const [ toggle , setToggle ] = useState <boolean> ( false )

    const router = useRouter()

    return <>

    <tr
        id='list'
        className='border-gray-100 border-b'
    >
        
        <td scope='row' className='p-2 h-10 w-10'>

            <div className='flex items-center justify-center h-full w-full'>

                <input
                    onChange={ ( e: any ) => {

                        // array container.
                        let cont: number[] = []
                        
                        all.current.childNodes.forEach( ( elem: any ) => {            
                            // this target the "tr" element with the "list" id                
                            elem.id === 'list'
                                ?   elem.firstChild.firstChild.firstChild.checked
                                        ?   cont.push( 1 )  // append "1" to the array "cont" if true.
                                        :   cont.push( 0 )  // append "0" to the array "cont" if false.
                                :   null
                        } )

                        /*
                            if all the computed value is equal to the length of the "childNodes" divided by "2"
                            since each loop contains additional "+1" element, this doubles the "siblings" for each loop
                            so you need to divide it by "2" because one "sibling" does not contain a "checkbox". 
                        */
                        cont.reduce( ( a: number , b: number ) => a + b , 0 ) === all.current.childNodes.length / 2
                            ?   one.current.checked = true      // "check" the "checkbox" with ref "one"
                            :   one.current.checked = false     // "un-check" the "checkbox" with ref "one"

                        // if all the "checkbox" are false
                        cont.reduce( ( a: number , b: number ) => a + b , 0 ) === 0
                            ?   setMenu( true )     // disable the "menu" state.
                            :   setMenu( false )    // enable the "menu" state.

                    } }
                    type='checkbox'
                    id={ obj.gid }
                    className='cursor-pointer outline-none disabled:opacity-75'
                    disabled={ disabled || selfDis }
                />

            </div>

        </td>
        <td scope='row' className='p-2 h-10 w-44'>
            <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-light'>
                { obj.gid }
            </div>
        </td>
        <td scope='row' className='p-2 h-10 w-44'>
            <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-light'>
                { obj.name }
            </div>
        </td>
        <td scope='row' className='p-2 h-10 w-max hidden md:table-cell'>

            <div className='hidden lg:flex items-center space-x-2 justify-start h-full w-full'>
                <span className='font-open-sans-light truncate'>{ obj.location }</span>
                <Link
                    href={ `https://www.google.com/maps/search/?api=1&query=${ obj.lat },${ obj.lng }` }
                    legacyBehavior
                >
                    <a className={ `${ obj.location === '' ? 'hidden' : '' } ${ obj.lng === '' || obj.lat === '' ? 'text-gray-300 pointer-events-none cursor-default' : 'text-blue-500 cursor-pointer outline-none' }` }>
                        <ArrowTopRightOnSquareIcon className='h-4 w-4' />
                    </a>
                </Link>
            </div>

        </td>
        <td scope='row' className='p-2 h-10 w-10'>

            <div className='relative z-10 flex items-center justify-center'>
                <button
                    onClick={ ( e: any ) => {
                        toggle
                        ?   (
                                setToggle( !toggle ),
                                e.target.parentNode.parentNode.parentNode.nextSibling.style.display = 'none'
                            )
                        :   (
                                setToggle( !toggle ),
                                e.target.parentNode.parentNode.parentNode.nextSibling.style.display = ''
                            )
                    } }
                    type='button'
                    className='text-blue-500 text-xs font-open-sans-regular cursor-pointer outline-none rounded-full p-1 transition ease-in-out duration-300 hover:text-blue-600 disabled:opacity-75 disabled:cursor-default hover:bg-blue-500/20 disabled:hover:text-blue-500'
                    disabled={ disabled || selfDis }
                >
                    {
                        !toggle
                            ?   <BarsArrowDownIcon className='relative -z-10 h-4 w-4' />
                            :   <BarsArrowUpIcon className='relative -z-10 h-4 w-4' />
                    }
                </button>
            </div>

        </td>

    </tr>
    
    <tr
        id='details'
        className='border-gray-100 border-b transition-all ease-in-out duration-300'
        style={ { display: 'none' } }
    >

        <td scope='row' colSpan={ 5 } className='bg-gray-50 p-3 sm:p-7'>

            <h1 className='text-blue-600 text-base font-open-sans-medium uppercase'>location details</h1>
            
            <div className='my-5'></div>

            <form
                onSubmit={ async ( e: any ) => {

                    e.preventDefault()

                    setSelfDis( true )
                    setLoading( true )

                    const createEncryptedPayload = new CreateEncryptedPayload()
                    const generateSerial = new GenerateSerial()

                    const serial: string = String( generateSerial.keyCode() )
                    const encrypt: string = createEncryptedPayload.wrap( {
                        serial: serial,
                        command: 'edit',
                        gid: fields.gid === '' ? obj.gid : fields.gid.trim(),
                        location: fields.location === '' ? obj.location : fields.location.trim(),
                        lng: fields.lng === '' ? String( obj.lng ) : fields.lng.trim(),
                        lat: fields.lat === '' ? String( obj.lat ) : fields.lat.trim()
                    } )

                    await axios ( {
                        method: 'post',
                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/groups`,
                        data: { payload: encrypt },
                        headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                    } )
                    .then ( ( res: any ) => {

                        if ( res.status === 200 ) {

                            const { location , lng , lat } = res.data

                            setTimeout( () => {

                                if ( location.pass && lng.pass && lat.pass ) {

                                    setLoading( false )

                                    setPass( true )
                                    setTimeout( () => router.reload() , 1000 )

                                } else {

                                    setSelfDis( false )
                                    setLoading( false )

                                    setPass( false )
                                    setWarning( { location: location.msg , lng: lng.msg , lat: lat.msg } )

                                }

                            } , 500 )

                        }
                        
                        else {

                            setTimeout( () => {

                                setSelfDis( false )
                                setLoading( false )

                                setPass( false )
                                setWarning( { location: 'an error occurred.' , lng: 'an error occurred.' , lat: 'an error occurred.' } )

                            } , 500 )

                        }

                    } )
                    .catch ( ( err: any ) => {

                        if ( err ) {
        
                            console.error( err.message )
        
                            setTimeout( () => {
                                
                                setSelfDis( false )
                                setLoading( false )

                                setPass( false )
                                setWarning( { location: 'an error occurred.' , lng: 'an error occurred.' , lat: 'an error occurred.' } )

                            } , 500 )
        
                        }
        
                    } )

                } }
                typeof='submit'
                className='grid w-full md:w-96'
            >   

                <div className='flex flex-col space-y-1'>
                    <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>location</label>
                    <input
                        type='text'
                        onChange={ ( e: any ) => {
                            setFields( { ... fields , location: e.target.value } )
                        } }
                        className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                        id='location'
                        placeholder={ obj.location === '' ? 'not set' : obj.location }
                        disabled={ disabled || selfDis || groups_edit ? false : true }
                    />
                    <div className='font-open-sans-regular text-red-500 text-xs text-right sm:text-left h-4 sm:h-5'>{ warning.location }</div>
                </div>

                <div className='flex flex-col space-y-1'>
                    <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>longitude</label>
                    <input
                        type='number'
                        onChange={ ( e: any ) => {
                            setFields( { ... fields , lng: e.target.value } )
                        } }
                        className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                        id='lng'
                        step='any'
                        placeholder={ obj.lng === '' ? 'not set' : obj.lng }
                        disabled={ disabled || selfDis || groups_edit ? false : true }
                    />
                    <div className='font-open-sans-regular text-red-500 text-xs text-right sm:text-left h-4 sm:h-5'>{ warning.lng }</div>
                </div>

                <div className='flex flex-col space-y-1'>
                    <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>latitude</label>
                    <input
                        type='number'
                        onChange={ ( e: any ) => {
                            setFields( { ... fields , lat: e.target.value } )
                        } }
                        className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                        id='lat'
                        step='any'
                        placeholder={ obj.lat === '' ? 'not set' : obj.lat }
                        disabled={ disabled || selfDis || groups_edit ? false : true }
                    />
                    <div className='font-open-sans-regular text-red-500 text-xs text-right sm:text-left h-4 sm:h-5'>{ warning.lat }</div>
                </div>

                <button
                    type='submit'
                    className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-xs uppercase cursor-pointer outline-none p-1 sm:w-20 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                    disabled={ disabled || selfDis || groups_edit ? false : true }
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

        </td>

    </tr>
    
    </>

}
