import { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { UserCircleIcon , ArrowUpTrayIcon , XCircleIcon , EyeSlashIcon , EyeIcon , CheckCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    user: any
    settings: any
}

export default function Credentials ( props: Props ): JSX.Element {

    const {
        user,
        settings: { user_upload }
    } = props

    type Fields = { image: string , name: string , username: string , current_password: string , new_password: string , retype_password: string }
    const [ fields , setFields ] = useState <Fields> ( { image: '' , name: '' , username: '' , current_password: '' , new_password: '' , retype_password: '' } )

    type Warning = { image: string , name: string , username: string , passwords: string }
    const [ warning , setWarning ] = useState <Warning> ( { image: '' , name: '' , username: '' , passwords: '' } )

    type Toggle = { current: boolean , new: boolean , retype: boolean }
    const [ toggle , setToggle ] = useState <Toggle> ( { current: false , new: false , retype: false } )

    type Disabled = { upload: boolean , credentials: boolean }
    const [ disabled , setDisabled ] = useState <Disabled> ( { upload: false , credentials: false } )
    
    type Loading = { upload: boolean , credentials: boolean }
    const [ loading , setLoading ] = useState <Loading> ( { upload: false , credentials: false } )

    type Pass = { upload: boolean , credentials: boolean }
    const [ pass , setPass ] = useState <Pass> ( { upload: false , credentials: false } )

    const router = useRouter()

    return <>

    <div className='grid gap-4 py-5'>

        <div className='px-5 md:px-10 lg:w-[720px]'>

            <div className='flex items-center space-x-2'>
                {
                    user.image === ''
                        ?   <UserCircleIcon className='h-20 w-20 text-gray-500' />
                            // image must have a parent of relative
                        :   <div className='relative flex items-center rounded-full h-20 w-20 overflow-hidden'>
                                <Image
                                    /*
                                        you need to add remote patterns if you want to access
                                        files in a local ip host with specific port.

                                        see "next.config.js"
                                    */
                                    src={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/content/${ user.account }/${ user.image }` }
                                    alt='image'
                                    fill
                                    style={ {
                                        objectFit: 'cover'
                                    } }
                                />
                            </div>
                }
                <div className='flex flex-col'>
                    <h1 className='text-blue-600 text-xl font-open-sans-medium'>{ user.name }</h1>
                    <span className='text-gray-950 text-xs font-open-sans-regular lowercase'>{ user.account }</span>
                </div>
            </div>

        </div>

        <div className='px-5 md:px-10 lg:w-[720px]'>

            <form
                onSubmit={ async ( e: any ) => {

                    e.preventDefault()

                    setDisabled( { ... disabled , upload: true } )
                    setLoading( { ... loading , upload: true } )

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
                        command: 'upload',
                        account: user.account,
                    } )

                    await axios ( {
                        method: 'post',
                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/account-settings-credentials`,
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

                                    setLoading( { ... loading , upload: false } )

                                    setPass( { ... pass , upload: true } )
                                    setTimeout( () => router.reload() , 1000 )

                                }
                                
                                else {

                                    setDisabled( { ... disabled , upload: false } )
                                    setLoading( { ... loading , upload: false } )

                                    setPass( { ... pass , upload: false } )
                                    setWarning( { ... warning , image: image.msg } )

                                }

                            } , 500 )

                        }

                        else {

                            setTimeout( () => {

                                setDisabled( { ... disabled , upload: false } )
                                setLoading( { ... loading , upload: false } )

                                setPass( { ... pass , upload: false } )
                                setWarning( { ... warning , image: 'an error occurred.' } )

                            } , 500 )

                        }

                    } )
                    .catch( ( err: any ) => {

                        if ( err ) {

                            console.error( err.message )

                            setTimeout( () => {

                                setDisabled( { ... disabled , upload: false } )
                                setLoading( { ... loading , upload: false } )

                                setPass( { ... pass , upload: false } )
                                setWarning( { ... warning , image: 'an error occurred.' } )

                            } , 500 )

                        }

                    } )

                } }
                className='block w-full'
            >
                <div className='flex flex-col space-y-3'>
                    <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>profile image</label>
                    <div className='block'>
                        <div className='flex items-center space-x-4 w-full'>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={ ( e: any ) => setWarning( { ... warning , image: '' } ) }
                                className='flex bg-gray-100 font-open-sans-regular text-sm cursor-pointer outline-none rounded py-1 w-full disabled:cursor-default disabled:opacity-75'
                                id='upload'
                                disabled={ disabled.upload || user_upload ? false : true }
                            />
                            <button
                                type='submit'
                                className={ `${ pass.upload ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none w-9 h-8 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                                disabled={ disabled.upload || user_upload ? false : true }
                            >
                                {
                                    loading.upload
                                        ?   <span>...</span>
                                        :   pass.upload
                                                ?   <CheckCircleIcon className='h-5 w-5' />
                                                :   <ArrowUpTrayIcon className='h-5 w-5' />
                                }
                            </button>
                        </div>
                        <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.image }</div>
                    </div>
                </div>
            </form>

        </div>

        <div className='px-5 md:px-10 lg:w-[720px]'>

            <form
                onSubmit={ async ( e: any ) => {

                    e.preventDefault()
                    
                    setDisabled( { ... disabled , credentials: true } )
                    setLoading( { ... loading , credentials: true } )

                    const createEncryptedPayload = new CreateEncryptedPayload()
                    const generateSerial = new GenerateSerial()

                    const serial: string = String( generateSerial.keyCode() )
                    const encrypt: string = createEncryptedPayload.wrap( {
                        serial: serial,
                        role: user.role,
                        account: user.account,
                        command: 'update',
                        /*
                            if the value of the 'name' field is not presented in setFields state,
                            pass the current value of the 'name' base on the 'user' value from
                            'getServerSideProps' this logic also aplies in the 'username' field.
                        */
                        name: fields.name.trim() === '' ? user.name : fields.name.trim(),
                        username: fields.username.trim() === '' ? user.username : fields.username.trim(),
                        current_password: fields.current_password.trim(),
                        new_password: fields.new_password.trim(),
                        retype_password: fields.retype_password.trim()
                    } )
                    
                    await axios ( {
                        method: 'post',
                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/account-settings-credentials`,
                        data: {
                            payload: encrypt
                        },
                        headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                    } )
                    .then ( ( res: any ) => {

                        if ( res.status === 200 ) {

                            const { name , username , password } = res.data

                            setTimeout( () => {
                                
                                if ( name.pass && username.pass && password.pass ) {

                                    setLoading( { ... loading , credentials: false } )

                                    setPass( { ... pass , credentials: true } )
                                    setTimeout( () => router.reload() , 1000 )
                                
                                } else {

                                    setDisabled( { ... disabled , credentials: false } )
                                    setLoading( { ... loading , credentials: false } )

                                    setPass( { ... pass , credentials: false } )
                                    setWarning( { ... warning , name: name.msg , username: username.msg , passwords: password.msg } )
                                
                                }
                                
                            } , 500 )

                        }
                        
                        else {

                            setTimeout( () => {

                                setDisabled( { ... disabled , credentials: false } )
                                setLoading( { ... loading , credentials: false } )

                                setPass( { ... pass , credentials: false } )
                                setWarning( { ... warning , name: 'an error occurred.' , username: 'an error occurred.' , passwords: 'an error occurred.' } )

                            } , 500 )

                        }

                    } )
                    .catch( ( err: any ) => {

                        if ( err ) {

                            console.error( err.message )

                            setTimeout( () => {

                                setDisabled( { ... disabled , credentials: false } )
                                setLoading( { ... loading , credentials: false } )

                                setPass( { ... pass , credentials: false } )
                                setWarning( { ... warning , name: 'an error occurred.' , username: 'an error occurred.' , passwords: 'an error occurred.' } )

                            } , 500 )

                        }

                    } )

                } }
                className='grid gap-4'
            >

                <div className='flex flex-col space-y-3'>
                    <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>name / nickname</label>
                    <input
                        type='text'
                        onChange={ ( e: any ) => {
                            setFields( { ... fields , name: e.target.value } )
                            setWarning( { ... warning , name: '' } )
                        } }
                        className={ `bg-gray-100 border-gray-100 font-open-sans-regular text-gray-950 text-sm border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                        id='name'
                        placeholder={ user.name }
                        disabled={ disabled.credentials }
                    />
                    <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.name }</div>
                </div>
                
                <div className='flex flex-col space-y-3'>
                    <div className='flex items-center justify-between'>
                        <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>username</label>
                        {
                            user.role === 'admin'
                                ?   <div className={ `flex items-center space-x-1 text-gray-300 text-xs uppercase` }>
                                        <XCircleIcon className='h-4 w-4' />
                                        <span className='font-open-sans-regular'>you cannot change this field.</span>
                                    </div>
                                :   <></>
                        }
                    </div>
                    <input
                        type='text'
                        onChange={ ( e: any ) => {
                            setFields( { ... fields , username: e.target.value } )
                            setWarning( { ... warning , username: '' } )
                        } }
                        className={ `bg-gray-100 border-gray-100 font-open-sans-regular text-gray-950 text-sm border-2 cursor-auto outline-none rounded py-1 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 ${ user.role === 'admin' ? 'disabled:cursor-not-allowed' : 'disabled:cursor-default' } disabled:opacity-75 disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                        id='username'
                        placeholder={ user.username }
                        disabled={ disabled.credentials || user.role === 'admin' }
                    />
                    <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.username }</div>
                </div>

                <div className='flex flex-col space-y-3'>
                    <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>password</label>

                    <div className='relative flex items-center'>
                        <input
                            type={ toggle.current ? 'text' : 'password' }
                            onChange={ ( e: any ) => {
                                setFields( { ... fields , current_password: e.target.value } )
                                setWarning( { ... warning , passwords: '' } )
                            } }
                            className='bg-gray-100 border-gray-100 font-open-sans-regular text-gray-950 text-sm border-2 cursor-auto outline-none rounded py-1 pl-2 pr-10 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:cursor-default disabled:opacity-75 disabled:hover:border-gray-100 disabled:focus:border-gray-100'
                            id='current_password'
                            placeholder={ 'old password' }
                            disabled={ disabled.credentials }
                        />
                        <button
                            onClick={ ( e: any ) => setToggle( { ... toggle , current: !toggle.current } ) }
                            type='button'
                            className='absolute right-3 text-gray-500 cursor-pointer outline-none disabled:cursor-default'
                            disabled={ disabled.credentials }
                        >
                            { toggle.current ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' /> }
                        </button>
                    </div>

                    <div className='relative flex items-center'>
                        <input
                            type={ toggle.new ? 'text' : 'password' }
                            onChange={ ( e: any ) => {
                                setFields( { ... fields , new_password: e.target.value } )
                                setWarning( { ... warning , passwords: '' } )
                            } }
                            className='bg-gray-100 border-gray-100 font-open-sans-regular text-gray-950 text-sm border-2 cursor-auto outline-none rounded py-1 pl-2 pr-10 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:cursor-default disabled:opacity-75 disabled:hover:border-gray-100 disabled:focus:border-gray-100'
                            id='new_password'
                            placeholder={ 'new password' }
                            disabled={ disabled.credentials }
                        />
                        <button
                            onClick={ ( e: any ) => setToggle( { ... toggle , new: !toggle.new } ) }
                            type='button'
                            className='absolute right-3 text-gray-500 cursor-pointer outline-none disabled:cursor-default'
                            disabled={ disabled.credentials }
                        >
                            { toggle.new ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' /> }
                        </button>
                    </div>
                    
                    <div className='relative flex items-center'>
                        <input
                            type={ toggle.retype ? 'text' : 'password' }
                            onChange={ ( e: any ) => {
                                setFields( { ... fields , retype_password: e.target.value } )
                                setWarning( { ... warning , passwords: '' } )
                            } }
                            className='bg-gray-100 border-gray-100 font-open-sans-regular text-gray-950 text-sm border-2 cursor-auto outline-none rounded py-1 pl-2 pr-10 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:cursor-default disabled:opacity-75 disabled:hover:border-gray-100 disabled:focus:border-gray-100'
                            id='retype_password'
                            placeholder={ 're-type password' }
                            disabled={ disabled.credentials }
                        />
                        <button
                            onClick={ ( e: any ) => setToggle( { ... toggle , retype: !toggle.retype } ) }
                            type='button'
                            className='absolute right-3 text-gray-500 cursor-pointer outline-none disabled:cursor-default'
                            disabled={ disabled.credentials }
                        >
                            { toggle.retype ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' /> }
                        </button>
                    </div>

                    <div className='font-open-sans-regular text-red-500 text-xs'>{ warning.passwords }</div>
                </div>

                <button
                    type='submit'
                    className={ `${ pass.credentials ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none p-1 w-40 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                    disabled={ disabled.credentials }
                >
                    {
                        loading.credentials
                            ?   <span>...</span>
                            :   pass.credentials
                                    ?   <CheckCircleIcon className='h-5 w-5' />
                                    :   'save'
                    }
                </button>

            </form>

        </div>

    </div>

    </>

}
