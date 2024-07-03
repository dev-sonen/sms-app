import { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { BarsArrowDownIcon , BarsArrowUpIcon , CheckCircleIcon , UserCircleIcon , ArrowUpTrayIcon } from '@heroicons/react/20/solid'

interface Props {
    disabled: boolean
    obj: any
    one: any                // for checkbox.
    all: any                // for checkbox.
    contacts_edit: boolean
    contacts_upload: boolean
    setMenu: Function       // enable and disabled "menu" state.
}

export default function ListContacts ( props: Props ): JSX.Element {

    const {
        disabled,
        obj,
        one,
        all,
        contacts_edit,
        contacts_upload,
        setMenu
    } = props

    type Fields = { mobile_no: string , contact_name: string }
    const [ fields , setFields ] = useState <Fields> ( { mobile_no: '' , contact_name: '' } )

    type Warning = { image: string , mobile_no: string , contact_name: string }
    const [ warning , setWarning ] = useState <Warning> ( { image: '' , mobile_no: '' , contact_name: '' } )

    const [ selfDis , setSelfDis ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )
    const [ toggle , setToggle ] = useState <boolean> ( false )

    const router = useRouter()
    
    console.log( 'contacts_upload: ' + contacts_upload )

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
                    id={ obj.cid }
                    className='cursor-pointer outline-none disabled:opacity-75'
                    disabled={ disabled || selfDis }
                />

            </div>

        </td>
        <td scope='row' className='p-2 h-10 w-44'>

            <div className='flex items-center justify-start h-full w-full'>
                <div className='flex items-center'>
                    {
                        obj.image === ''
                            ?   <UserCircleIcon className='h-6 w-6 text-gray-500' />
                                // image must have a parent of relative
                            :   <div className='relative flex items-center rounded-full h-6 w-6 overflow-hidden'>
                                    <Image
                                        src={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/content/contacts/${ obj.cid }/${ obj.image }` }
                                        alt='image'
                                        fill
                                        style={ {
                                            objectFit: 'cover'
                                        } }
                                    />
                                </div>
                    }
                </div>
                <div className='mx-0.5'></div>
                <span className='font-open-sans-light'>{ obj.mobile_no }</span>
            </div>

        </td>
        <td scope='row' className='p-2 h-10 w-44'>

            <div className='flex items-center justify-start h-full w-full'>
                <div className='grid'>
                    <span className='font-open-sans-light'>{ obj.group_id }</span>
                    <span className='font-open-sans-light text-xs truncate'>{ obj.group_name }</span>
                </div>
            </div>

        </td>
        <td scope='row' className='p-2 h-10 w-max hidden md:table-cell'>
            <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-light'>
                { obj.owners_name }
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

            <h1 className='text-blue-600 text-base font-open-sans-medium uppercase'>contact details</h1>
            
            <div className='my-5'></div>
            
            <div className='grid gap-5'>
                <form
                    onSubmit={ async ( e: any ) => {

                        e.preventDefault()

                        setSelfDis( true )
                        setLoading( true )

                        const file = e.target.upload.files[ 0 ]

                        const toBase64 = ( file: any ) => new Promise ( ( res , rej ) => {
                            const reader = new FileReader()
                            reader.readAsDataURL( file )
                            reader.onload = () => res( reader.result )
                            reader.onerror = err => rej( err )
                        } )

                        const createEncryptedPayload = new CreateEncryptedPayload()
                        const generateSerial = new GenerateSerial()

                        const serial: string = String( generateSerial.keyCode() )
                        const encrypt: string = createEncryptedPayload.wrap( {
                            serial: serial,
                            cid: obj.cid,
                            command: 'upload'
                        } )

                        await axios ( {
                            method: 'post',
                            url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/contacts`,
                            data: {
                                payload: encrypt,
                                file: {
                                    image: file === undefined ? '' : await toBase64( file ),
                                    type: file === undefined ? '' : file.type,
                                    size: file === undefined ? 0 : file.size
                                }
                            },
                            headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                        } )
                        .then ( ( res: any ) => {

                            if ( res.status === 200 ) {

                                const { image } = res.data 
                                
                                setTimeout( () => {

                                    if ( image.pass ) {

                                        setLoading( false )

                                        setPass( true )
                                        setTimeout( () => router.reload() , 1000 )

                                    }

                                    else {

                                        setSelfDis( false )
                                        setLoading( false )
        
                                        setPass( false )
                                        setWarning( { ... warning , image: image.msg } )

                                    }

                                } , 500 )

                            }

                            else {

                                setTimeout( () => {

                                    setSelfDis( false )
                                    setLoading( false )

                                    setPass( false )
                                    setWarning( { ... warning , image: 'an error occurred.' } )

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
                                    setWarning( { ... warning , image: 'an error occurred.' } )

                                } , 500 )                            

                            }

                        } )

                    } }
                    typeof='submit'
                    className='flex items-center space-x-5 w-full md:w-96'
                >
                    <div className='w-max'>
                        {
                            obj.image === ''
                                ?   <UserCircleIcon className='h-14 md:h-16 w-14 md:w-16 text-gray-500' />
                                    // image must have a parent of relative
                                :   <div className='relative flex items-center border-red-100 border rounded-full h-14 md:h-16 w-14 md:w-16 overflow-hidden'>
                                        <Image
                                            src={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/content/contacts/${ obj.cid }/${ obj.image }` }
                                            alt='image'
                                            fill
                                            style={ {
                                                objectFit: 'cover'
                                            } }
                                        />
                                    </div>
                        }
                    </div>

                    <div className='flex flex-col space-y-1 w-full'>
                        <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>contact image</label>
                        <div className='grid gap-1'>
                            {
                                contacts_upload
                                    ?   <div className='flex items-center space-x-2 w-full'>
                                            <input
                                                type='file'
                                                accept='image/*'
                                                onChange={ ( e: any ) => setWarning( { ... warning , image: '' } ) }
                                                className='flex bg-gray-100 font-open-sans-regular text-xs cursor-pointer outline-none rounded py-1 w-full disabled:cursor-default disabled:opacity-75'
                                                id='upload'
                                                disabled={ disabled || selfDis || contacts_edit ? false : true }
                                            />
                                            <button
                                                type='submit'
                                                className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none h-7 w-8 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                                                disabled={ disabled || selfDis || contacts_edit ? false : true }
                                            >
                                                {
                                                    loading
                                                        ?   <span>...</span>
                                                        :   pass
                                                                ?   <CheckCircleIcon className='h-4 w-4' />
                                                                :   <ArrowUpTrayIcon className='h-4 w-4' />
                                                }
                                            </button>
                                        </div>
                                    :   <div className='flex items-center space-x-2 w-full'>
                                            <input
                                                type='file'
                                                accept='image/*'
                                                className='flex bg-gray-100 font-open-sans-regular text-xs cursor-pointer outline-none rounded py-1 w-full disabled:cursor-default disabled:opacity-75'
                                                id='upload'
                                                disabled={ true }
                                            />
                                            <button
                                                type='submit'
                                                className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none h-7 w-8 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                                                disabled={ true }
                                            >
                                                {
                                                    loading
                                                        ?   <span>...</span>
                                                        :   pass
                                                                ?   <CheckCircleIcon className='h-4 w-4' />
                                                                :   <ArrowUpTrayIcon className='h-4 w-4' />
                                                }
                                            </button>
                                        </div>
                            }
                            <div className='font-open-sans-regular text-red-500 text-xs h-4'>{ warning.image }</div>
                        </div>
                    </div>
                </form>
                
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
                            cid: obj.cid,
                            mobile_no: fields.mobile_no === '' ? obj.mobile_no.replace( /^\+63/g , '0' ) : fields.mobile_no.trim(),
                            contact_name: fields.contact_name === '' ? obj.owners_name : fields.contact_name.trim()
                        } )

                        await axios ( {
                            method: 'post',
                            url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/contacts`,
                            data: { payload: encrypt },
                            headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                        } )
                        .then ( ( res: any ) => {

                            if ( res.status === 200 ) {

                                const { mobile_no , contact_name } = res.data

                                setTimeout( () => {

                                    if ( mobile_no.pass && contact_name.pass ) {

                                        setLoading( false )

                                        setPass( true )
                                        setTimeout( () => router.reload() , 1000 )

                                    } else {

                                        setSelfDis( false )
                                        setLoading( false )
    
                                        setPass( false )
                                        setWarning( { ... warning , mobile_no: mobile_no.msg , contact_name: contact_name.msg } )

                                    }

                                } , 500 )

                            }

                            else {

                                setTimeout( () => {

                                    setSelfDis( false )
                                    setLoading( false )

                                    setPass( false )
                                    setWarning( { ... warning , mobile_no: 'an error occurred.' , contact_name: 'an error occurred.' } )

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
                                    setWarning( { ... warning , mobile_no: 'an error occurred.' , contact_name: 'an error occurred.' } )

                                } , 500 )

                            }

                        } )

                    } }
                    typeof='submit'
                    className='grid w-full md:w-96'
                >

                    <div className='flex flex-col space-y-1'>
                        <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>mobile no.</label>
                        <input
                            type='number'
                            inputMode='numeric' //
                            onChange={ ( e: any ) => setFields( { ... fields , mobile_no: e.target.value } ) }
                            className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                            id='mobile_no'
                            placeholder={ obj.mobile_no.replace( /^\+63/g , '0' ) }
                            disabled={ disabled || selfDis || contacts_edit ? false : true }
                        />
                        <div className='font-open-sans-regular text-red-500 text-xs h-5'>{ warning.mobile_no }</div>
                    </div>

                    <div className='flex flex-col space-y-1'>
                        <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>contact name</label>
                        <input
                            type='text'
                            onChange={ ( e: any ) => setFields( { ... fields , contact_name: e.target.value } ) }
                            className={ `bg-gray-100 border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                            id='contact_name'
                            placeholder={ obj.owners_name }
                            disabled={ disabled || selfDis || contacts_edit ? false : true }
                        />
                        <div className='font-open-sans-regular text-red-500 text-xs h-5'>{ warning.contact_name }</div>
                    </div>

                    <button
                        type='submit'
                        className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-xs uppercase cursor-pointer outline-none p-1 sm:w-20 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                        disabled={ disabled || selfDis || contacts_edit ? false : true }
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
            </div>

        </td>

    </tr>

    </>

}
