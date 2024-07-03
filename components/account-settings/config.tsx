import { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { ArrowUpTrayIcon , CheckCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    user: any
    settings: any
}

export default function Config ( props: Props ): JSX.Element {

    const { user , settings } = props

    type Fields = { system_image: string , contact_limit: number , signup_feature: boolean , user_upload: boolean , contacts_upload: boolean }
    const [ fields , setFields ] = useState <Fields> ( { system_image: settings.system_image , contact_limit: settings.contact_limit , signup_feature: settings.signup_feature , user_upload: settings.user_upload , contacts_upload: settings.contacts_upload } )

    type Warning = { system_image: string , contact_limit: string  }
    const [ warning , setWarning ] = useState <Warning> ( { system_image: '' , contact_limit: '' } )

    type Disabled = { wallpaper: boolean , config: boolean }
    const [ disabled , setDisabled ] = useState <Disabled> ( { wallpaper: false , config: false } )
    
    type Loading = { wallpaper: boolean , config: boolean }
    const [ loading , setLoading ] = useState <Loading> ( { wallpaper: false , config: false } )

    type Pass = { wallpaper: boolean , config: boolean }
    const [ pass , setPass ] = useState <Pass> ( { wallpaper: false , config: false } )

    const router = useRouter()

    if ( user.role === 'admin' ) {

        return <>

            <div className='grid gap-4 py-5'>

                <div className='px-5 md:px-10 lg:w-[720px]'>

                    <div className='relative flex items-center rounded h-[100px] w-[200px] overflow-hidden'>
                        <Image
                            src={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/system/${ settings.system_image }` }
                            alt='image'
                            fill
                            priority={ true }
                            blurDataURL={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/system/${ settings.system_image }` }
                            placeholder='blur'
                            sizes='(max-width: 200px)'
                            style={ {
                                objectFit: 'cover'
                            } }
                        />
                    </div>

                </div>

                <div className='px-5 md:px-10 lg:w-[720px]'>

                    <form
                        onSubmit={ async ( e: any ) => {

                            e.preventDefault()

                            setDisabled( { ... disabled , wallpaper: true } )
                            setLoading( { ... loading , wallpaper: true } )

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
                                role: user.role,
                                command: 'upload'
                            } )

                            await axios ( {
                                method: 'post',
                                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/account-settings-configuration`,
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

                                            setLoading( { ... loading , wallpaper: false } )

                                            setPass( { ... pass , wallpaper: true } )
                                            setTimeout( () => router.reload() , 1000 )

                                        }
                                        
                                        else {

                                            setDisabled( { ... disabled , wallpaper: false } )
                                            setLoading( { ... loading , wallpaper: false } )

                                            setPass( { ... pass , wallpaper: false } )
                                            setWarning( { ... warning , system_image: image.msg } )

                                        }

                                    } , 500 )

                                }

                                else {

                                    setTimeout( () => {

                                        setDisabled( { ... disabled , wallpaper: false } )
                                        setLoading( { ... loading , wallpaper: false } )

                                        setPass( { ... pass , wallpaper: false } )
                                        setWarning( { ... warning , system_image: 'an error occurred.' } )                              

                                    } , 500 )

                                }

                            } )
                            .catch ( ( err: any ) => {

                                if ( err ) {

                                    console.error( err.message )

                                    setTimeout( () => {

                                        setDisabled( { ... disabled , wallpaper: false } )
                                        setLoading( { ... loading , wallpaper: false } )

                                        setPass( { ... pass , wallpaper: false } )
                                        setWarning( { ... warning , system_image: 'an error occurred.' } )

                                    } , 500 )

                                }

                            } )

                        } }
                        className='block w-full'
                    >
                        <div className='flex flex-col space-y-3'>
                            <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>system wallpaper</label>
                            <div className='block'>
                                <div className='flex items-center space-x-4 w-full'>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={ ( e: any ) => setWarning( { ... warning , system_image: '' } ) }
                                        className='flex bg-gray-100 font-open-sans-regular text-sm cursor-pointer outline-none rounded py-1 w-full disabled:cursor-default disabled:opacity-75'
                                        id='upload'
                                        disabled={ disabled.wallpaper }
                                    />
                                    <button
                                        type='submit'
                                        className={ `${ pass.wallpaper ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none w-9 h-8 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                                        disabled={ disabled.wallpaper }
                                    >
                                        {
                                            loading.wallpaper
                                                ?   <span>...</span>
                                                :   pass.wallpaper
                                                        ?   <CheckCircleIcon className='h-5 w-5' />
                                                        :   <ArrowUpTrayIcon className='h-5 w-5' />
                                        }
                                    </button>
                                </div>
                                <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.system_image }</div>
                            </div>
                        </div>
                    </form>

                </div>

                <div className='px-5 md:px-10 lg:w-[720px]'>

                    <form
                        onSubmit={ async ( e: any ) => {

                            e.preventDefault()

                            setDisabled( { ... disabled , config: true } )
                            setLoading( { ... loading , config: true } )

                            const createEncryptedPayload = new CreateEncryptedPayload()
                            const generateSerial = new GenerateSerial()

                            const serial: string = String( generateSerial.keyCode() )
                            const encrypt: string = createEncryptedPayload.wrap( {
                                serial: serial,
                                role: user.role,
                                command: 'update',
                                contact_limit: fields.contact_limit,
                                signup_feature: fields.signup_feature,
                                user_upload: fields.user_upload,
                                contacts_upload: fields.contacts_upload,
                            } )

                            await axios ( {
                                method: 'post',
                                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/account-settings-configuration`,
                                data: {
                                    payload: encrypt
                                },
                                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                            } )
                            .then ( ( res: any ) => {

                                if ( res.status === 200 ) {

                                    const { config } = res.data

                                    setTimeout( () => {

                                        if ( config.pass ) {

                                            setLoading( { ... loading , config: false } )

                                            setPass( { ... pass , config: true } )
                                            setTimeout( () => router.reload() , 1000 )

                                        }

                                        else {

                                            setDisabled( { ... disabled , config: false } )
                                            setLoading( { ... loading , config: false } )
    
                                            setPass( { ... pass , config: false } )
                                            setWarning( { ... warning , contact_limit: config.msg } )

                                        }

                                    } , 500 )

                                }
                                
                                else {

                                    setTimeout( () => {

                                        setDisabled( { ... disabled , config: false } )
                                        setLoading( { ... loading , config: false } )

                                        setPass( { ... pass , config: false } )
                                        setWarning( { ... warning , contact_limit: 'an error occurred.' } )

                                    } , 500 )

                                }

                            } )
                            .catch ( ( err: any ) => {

                                if ( err ) {

                                    console.error( err.message )

                                    setTimeout( () => {

                                        setDisabled( { ... disabled , config: false } )
                                        setLoading( { ... loading , config: false } )

                                        setPass( { ... pass , config: false } )
                                        setWarning( { ... warning , contact_limit: 'an error occurred.' } )

                                    } , 500 )

                                }

                            } )

                        } }
                        className='grid gap-4'
                    >
                        <div className='flex flex-col space-y-3'>
                            <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>group contacts limit</label>
                            <input
                                type='text'
                                onChange={ ( e: any ) => {
                                    setFields( { ... fields , contact_limit: e.target.value } )
                                    setWarning( { ... warning , contact_limit: '' } )
                                } }
                                className={ `bg-gray-100 border-gray-100 font-open-sans-regular text-gray-950 text-sm border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                id='contact_limit'
                                placeholder={ settings.contact_limit }
                                disabled={ disabled.config }
                            />
                            <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.contact_limit }</div>
                        </div>
                        
                        <div className='flex items-center space-x-2'>
                            <div className='flex items-center space-x-2'>
                                <input
                                    type='checkbox'
                                    onChange={ ( e: any ) => setFields( { ... fields , signup_feature: e.target.checked } ) }
                                    className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                    id='signup_feature'
                                    defaultChecked={ fields.signup_feature }
                                    disabled={ disabled.config }
                                />
                            </div>
                            <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>signup or create user accounts</label>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <div className='flex items-center space-x-2'>
                                <input
                                    type='checkbox'
                                    onChange={ ( e: any ) => setFields( { ... fields , user_upload: e.target.checked  } ) }
                                    className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                    id='user_upload'
                                    defaultChecked={ fields.user_upload }
                                    disabled={ disabled.config }
                                />
                            </div>
                            <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>upload image for users <span className='text-gray-500 text-xs lowercase'>&#40;&ldquo;disabling this feature can save disk space&rdquo;&#41;</span></label>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <div className='flex items-center space-x-2'>
                                <input
                                    type='checkbox'
                                    onChange={ ( e: any ) => setFields( { ... fields , contacts_upload: e.target.checked  } ) }
                                    className='outline-none transition-all ease-in-out duration-300 disabled:opacity-75'
                                    id='contacts_upload'
                                    defaultChecked={ fields.contacts_upload }
                                    disabled={ disabled.config }
                                />
                            </div>
                            <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>upload image for contacts <span className='text-gray-500 text-xs lowercase'>&#40;&ldquo;disabling this feature can save disk space&rdquo;&#41;</span></label>
                        </div>

                        <button
                            type='submit'
                            className={ `${ pass.config ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none p-1 w-40 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                            disabled={ disabled.config }
                        >
                            {
                                loading.config
                                    ?   <span>...</span>
                                    :   pass.config
                                            ?   <CheckCircleIcon className='h-5 w-5' />
                                            :   'save'
                            }
                        </button>

                    </form>
                     
                </div>

            </div>
        
        </>

    }

    return <>
    
    <div className='grid gap-5 px-5 md:px-10 my-10'>
        <h1 className='text-gray-950 font-open-sans-regular capitalize'>404 page not found.</h1>
    </div>
    
    </>

}
