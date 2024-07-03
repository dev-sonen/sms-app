import { useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { EyeSlashIcon , EyeIcon , FireIcon , QuestionMarkCircleIcon , ExclamationTriangleIcon , XCircleIcon , CheckCircleIcon , XMarkIcon } from '@heroicons/react/24/solid'

interface Props {
    csrfToken: string
    status: string
    settings: any
}

export default function Signin ( props: Props ): JSX.Element {

    const {
        csrfToken,
        status,
        settings
    } = props

    const router = useRouter()

    type Fields = { username: string , password: string }
    const [ fields , setFields ] = useState <Fields> ( { username: '' , password: '' } )

    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ toggle , setToggle ] = useState <boolean> ( false )
    const [ code , setCode ] = useState <string> ( '' )

    return <>

    <div className='flex items-center justify-center h-full w-full p-5'>
        <div className='bg-white shadow-black/25 drop-shadow-md shadow-md rounded-3xl p-5 sm:p-8 w-[420px] transition-all ease-in-out duration-300'>
            <form
                onSubmit={ async ( e: any ) => {
                    
                    e.preventDefault()

                    setDisabled( true )
                    setLoading( true )

                    const generateSerial = new GenerateSerial()
                    const createEncryptedPayload = new CreateEncryptedPayload()

                    const serial: string = String( generateSerial.keyCode() )
                    const encrypt: string = createEncryptedPayload.wrap( { serial: serial , username: fields.username , password: fields.password } )

                    await axios ( {
                        method: 'post',
                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/signin`,
                        data: { payload: encrypt },
                        headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                    } )
                    .then( async ( res: any ) => {

                        const { code , payload } = res.data

                        if ( code === '5c85' ) {

                            const serial: string = String( generateSerial.keyCode() )

                            await axios ( {
                                method: 'post',
                                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/auth/callback/credentials?serial=${ serial }`,
                                data: {
                                    payload: payload,
                                    redirect: true,
                                    callbackUrl: '/dashboard',
                                    csrfToken: csrfToken,
                                    json: true
                                },
                                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                            } )
                            .then( res => {

                                setTimeout( () => {

                                    setCode( code )
                                    setLoading( false )

                                    setTimeout( () => {
                                        router.reload()
                                    } , 1000 )

                                } , 1000 )
            
                            } )
                            .catch( err => {
                                
                                if ( err ) {

                                    console.error( err.message )
                            
                                    setDisabled( false )
                                    setLoading( false )
                                    setCode( 'error' )

                                }
                
                            } )

                        } else {

                            setTimeout( () => {
                                setLoading( false )
                                setDisabled( false )
                                setCode( code )
                            } , 1000 )

                        }

                    } )
                    .catch( err => {
                        
                        if ( err ) {

                            console.error( err.message )
                            
                            setDisabled( false )
                            setLoading( false )
                            setCode( 'error' )
                        
                        }

                    } )

                } }
                typeof='submit'
                className='block'
            >
                <h1 className='text-gray-950 font-open-sans-bold text-2xl uppercase'>sign in</h1>
                
                <div className='my-5'></div>

                <div className='flex flex-col space-y-5'>
                    <div className='relative z-10'>
                        <input
                            onChange={ ( e: any ) => setFields( { ... fields , username: String( e.target.value ) } ) }
                            type='text'
                            placeholder='username'
                            id='username'
                            className={ `border-gray-300 border-2 text-gray-500 font-open-sans-regular text-sm outline-none cursor-text rounded-lg py-2 px-2 w-full transition ease-in-out duration-300 hover:border-blue-500 focus:border-blue-500 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-300 disabled:focus:border-gray-300` }
                            disabled={ disabled || status === 'loading' }
                        />
                        <label htmlFor='username' className='absolute text-gray-950 text-xs'>{ '' }</label>
                    </div>
                    <div className='relative z-10'>
                        <div className='relative flex items-center'>
                            <input
                                onChange={ ( e: any ) => setFields( { ... fields , password: String( e.target.value ) } ) }
                                type={ toggle ? 'text' : 'password' }
                                placeholder='password'
                                id='password'
                                className={ `border-gray-300 border-2 text-gray-500 font-open-sans-regular text-sm outline-none cursor-text rounded-lg py-2 pl-2 pr-10 w-full transition ease-in-out duration-300 hover:border-blue-500 focus:border-blue-500 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-300 disabled:focus:border-gray-300` }
                                disabled={ disabled || status === 'loading' }
                            />
                            <button
                                onClick={ ( e: any ) => setToggle( !toggle ) }
                                type='button'
                                className='absolute right-3 text-gray-500 font-open-sans-regular cursor-pointer outline-none disabled:cursor-default'
                                disabled={ disabled || status === 'loading' }                                        
                            >
                                { toggle ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' /> }
                            </button>
                        </div>
                        <label htmlFor='password' className='absolute text-gray-950 text-xs'>{ '' }</label>
                    </div>

                    {
                            code === 'error'
                                ?   <div className='flex items-center space-x-1 bg-red-300 text-red-700 p-2 rounded'>
                                        <FireIcon className='h-5 w-5' />
                                        <div className='font-open-sans-regular text-xs uppercase'>unknown error</div>
                                    </div>
                        :   code === 'd235'
                                ?   <div className='flex items-center space-x-1 bg-gray-200 text-gray-600 p-2 rounded'>
                                        <QuestionMarkCircleIcon className='h-5 w-5' />
                                        <div className='font-open-sans-regular text-xs uppercase'>please enter your username and password</div>
                                    </div>
                        :   code === 'e928'
                                ?   <div className='flex items-center space-x-1 bg-yellow-200 text-yellow-600 p-2 rounded'>
                                        <ExclamationTriangleIcon className='h-5 w-5' />
                                        <div className='font-open-sans-regular text-xs uppercase'>this account does not exist</div>
                                    </div>
                        :   code === '27f1'
                                ?   <div className='flex items-center space-x-1 bg-red-200 text-red-600 p-2 rounded'>
                                        <XCircleIcon className='h-5 w-5' />
                                        <div className='font-open-sans-regular text-xs uppercase'>invalid password</div>
                                    </div>
                        :   <></>
                    }

                    <button
                        type='submit'
                        className={ `flex justify-center ${ code === '5c85' ? 'border-green-500 bg-green-500' : 'border-blue-600 bg-blue-600' } border-2 text-white font-open-sans-regular text-sm font-semibold uppercase cursor-pointer outline-none rounded-lg py-2 transition ease-in-out duration-300 ${ code === '5c85' ? 'hover:border-green-500 focus:border-green-500' : 'hover:border-blue-400 focus:border-blue-400' } disabled:opacity-75 disabled:cursor-default ${ code === '5c85' ? 'disabled:hover:border-green-500 disabled:focus:border-green-500' : 'disabled:hover:border-blue-600 disabled:focus:border-blue-600' }` }
                        disabled={ disabled || status === 'loading' }
                    >
                        {
                                loading || status === 'loading'
                                    ?   <>...</>
                            :   code === '5c85'
                                    ?   <CheckCircleIcon className='h-5 w-5' />
                                    :   <div>login</div>
                        }
                    </button>

                    <div className='flex flex-col items-center justify-center'>
                        <Link
                            href={ '/signup' }
                            legacyBehavior
                        >
                            <a
                                className={ `${ !settings.signup_feature ? 'pointer-events-none cursor-default opacity-75 text-gray-400 hover:text-gray-400 focus:text-gray-400 line-through' : 'pointer-events-auto cursor-pointer opacity-100 text-blue-600 hover:text-blue-400 focus:text-blue-400' } font-open-sans-semibold uppercase text-center outline-none transition ease-in-out duration-300` }
                            >
                                <div>create account</div>
                            </a>
                        </Link>
                        {
                            !settings.signup_feature
                                ?   <div className='text-gray-400 text-xs font-open-sans-light'>disabled by admin</div>
                                :   <></>
                        }
                    </div>

                    
                </div>

            </form>
        </div>
    </div>
    
    </>

}