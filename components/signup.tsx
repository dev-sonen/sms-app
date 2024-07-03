import { useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import { EyeSlashIcon , EyeIcon , CheckCircleIcon } from '@heroicons/react/24/solid'

interface Props {
    csrfToken: string
    status: string
}

export default function Signup ( props: Props ): JSX.Element {

    const { csrfToken , status } = props

    type Fields = { name: string , username: string , password: string , retype: string }
    const [ fields , setFields ] = useState <Fields> ( { name: '' , username: '' , password: '' , retype: '' } )

    const [ warning , setWarning ] = useState <Array<string>> ( [] )

    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )

    type Toggle = { password: boolean , retype: boolean }
    const [ toggle , setToggle ] = useState <Toggle> ( { password: false , retype: false } )

    const router = useRouter()

    return <>
    
    <div className='flex items-center justify-center h-full w-full p-5'>
        <div className='bg-white shadow-black/25 drop-shadow-md shadow-md rounded-3xl p-5 sm:p-8 w-[420px] transition-all ease-in-out duration-300'>
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
                        name: fields.name.trim(),
                        username: fields.username.trim(),
                        password: fields.password.trim(),
                        retype: fields.retype.trim()
                    } )

                    await axios ( {
                        method: 'post',
                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/signup`,
                        data: { payload: encrypt },
                        headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                    } )
                    .then ( async ( res: any ) => {

                        if ( res.status === 200 ) {

                            const { username , password , name } = res.data

                            if ( username.pass && password.pass && name.pass ) {

                                const serial: string = String( generateSerial.keyCode() )

                                await axios ( {
                                    method: 'post',
                                    url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/auth/callback/credentials?serial=${ serial }`,
                                    data: {
                                        payload: encrypt,
                                        redirect: true,
                                        callbackUrl: '/dashboard',
                                        csrfToken: csrfToken,
                                        json: true
                                    },
                                    headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                                } )
                                .then( ( res: any ) => {

                                    setPass( true )

                                    setLoading( false )
                                    setWarning( [] )

                                    setTimeout( () => {
                                        router.reload()
                                    } , 1000 )
                
                                } )
                                .catch( ( err: any ) => {
                                    
                                    if ( err ) {
    
                                        console.error( err.message )
                                
                                        setDisabled( false )
                                        setLoading( false )
                                        setWarning( [ 'oops something went wrong!' ] )
    
                                    }
                    
                                } )

                            } else {

                                /*
                                    if all the "pass" values are all true set the "warning" array state to empty
                                    this will hide the "warning element" above the "create account
                                    and login" button.
                                */
                                setTimeout( () => {
                                    setDisabled( false )
                                    setLoading( false )
                                    setWarning( [ username.msg , password.msg , name.msg ] )
                                } , 500 )

                            }

                        } else {

                            setTimeout( () => {
                                setDisabled( false )
                                setLoading( false )
                                setWarning( [ 'oops something went wrong!' ] )
                            } , 500 )

                        }

                    } )
                    .catch ( ( err: any ) => {

                        if ( err ) {

                            setTimeout( () => {
                                console.error( err.message )
                                setDisabled( false )
                                setLoading( false )
                                setWarning( [ 'oops something went wrong!' ] )
                            } , 500 )
                        
                        }

                    } )

                } }
                typeof='submit'
                className='grid gap-3'
            >
                <h1 className='text-gray-950 font-open-sans-bold text-2xl uppercase'>signup</h1>

                <div className='block'>
                    <div className='flex flex-col space-y-1'>
                        <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>name</label>
                        <input
                            type='text'
                            onChange={ ( e: any ) => setFields( { ... fields , name: e.target.value } ) }
                            className={ `bg-gray-200 border-gray-200 font-open-sans-regular text-gray-950 text-sm border-2 cursor-auto outline-none rounded-lg py-2 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-200 disabled:focus:border-gray-200` }
                            id='name'
                            placeholder='enter your name or nickname'
                            disabled={ disabled }
                        />
                    </div>
                </div>

                <div className='block'>
                    <div className='flex flex-col space-y-1'>
                        <label className='text-blue-600 text-sm font-open-sans-medium uppercase'>username</label>
                        <input
                            type='text'
                            onChange={ ( e: any ) => setFields( { ... fields , username: e.target.value } ) }
                            className={ `bg-gray-200 border-gray-200 font-open-sans-regular text-gray-950 text-sm border-2 cursor-auto outline-none rounded-lg py-2 px-2 transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-200 disabled:focus:border-gray-200` }
                            id='username'
                            placeholder='enter your username'
                            disabled={ disabled }
                        />
                    </div>
                </div>

                <div className='relative z-10'>
                    <div className='relative flex items-center'>
                        <input
                            onChange={ ( e: any ) => setFields( { ... fields , password: e.target.value } ) }
                            type={ toggle.password ? 'text' : 'password' }
                            placeholder='password'
                            id='password'
                            className={ `border-gray-300 border-2 text-gray-500 font-open-sans-regular text-sm outline-none cursor-text rounded-lg py-2 pl-2 pr-10 w-full transition ease-in-out duration-300 hover:border-blue-500 focus:border-blue-500 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-300 disabled:focus:border-gray-300` }
                            disabled={ disabled || status === 'loading' }
                        />
                        <button
                            onClick={ ( e: any ) => setToggle( { ... toggle , password: !toggle.password } ) }
                            type='button'
                            className='absolute right-3 text-gray-500 font-open-sans-regular cursor-pointer outline-none disabled:cursor-default'
                            disabled={ disabled || status === 'loading' }                                        
                        >
                            { toggle.password ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' /> }
                        </button>
                    </div>
                </div>
                <div className='relative z-10'>
                    <div className='relative flex items-center'>
                        <input
                            onChange={ ( e: any ) => setFields( { ... fields , retype: e.target.value } ) }
                            type={ toggle.retype ? 'text' : 'password' }
                            placeholder='retype your password'
                            id='retype'
                            className={ `border-gray-300 border-2 text-gray-500 font-open-sans-regular text-sm outline-none cursor-text rounded-lg py-2 pl-2 pr-10 w-full transition ease-in-out duration-300 hover:border-blue-500 focus:border-blue-500 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-300 disabled:focus:border-gray-300` }
                            disabled={ disabled || status === 'loading' }
                        />
                        <button
                            onClick={ ( e: any ) => setToggle( { ... toggle , retype: !toggle.retype } ) }
                            type='button'
                            className='absolute right-3 text-gray-500 font-open-sans-regular cursor-pointer outline-none disabled:cursor-default'
                            disabled={ disabled || status === 'loading' }                                        
                        >
                            { toggle.retype ? <EyeIcon className='h-5 w-5' /> : <EyeSlashIcon className='h-5 w-5' /> }
                        </button>
                    </div>
                </div>

                {/* if the "warning" array state length is "hide" this card. */}
                <div className={ `${ warning.length === 0 ? 'hidden' : 'flex flex-col bg-red-300 text-red-700 p-2 rounded' }` }>

                    {
                        warning.map( ( arr: string , ind: number ) => (
                            <div key={ ind } className='font-open-sans-regular text-xs uppercase'>
                                {
                                    arr === ''
                                        ?   null
                                        :   <div className='flex space-x-1 py-0.5'>
                                                <span>-</span>
                                                <span>{ arr }</span>
                                            </div>
                                }
                            </div>
                        ) )
                    }

                </div>

                <button
                    type='submit'
                    className={ `flex justify-center ${ pass ? 'border-green-500 bg-green-500' : 'border-blue-600 bg-blue-600' } border-2 text-white font-open-sans-regular text-sm font-semibold uppercase cursor-pointer outline-none rounded-lg py-2 transition ease-in-out duration-300 ${ pass ? 'hover:border-green-500 focus:border-green-500' : 'hover:border-blue-400 focus:border-blue-400' } disabled:opacity-75 disabled:cursor-default ${ pass ? 'disabled:hover:border-green-500 disabled:focus:border-green-500' : 'disabled:hover:border-blue-600 disabled:focus:border-blue-600' }` }
                    disabled={ disabled || status === 'loading' }
                >
                    {
                            loading || status === 'loading'
                                ?   <>...</>
                        :   pass
                                ?   <CheckCircleIcon className='h-5 w-5' />
                                :   <div>create account and login</div>
                    }
                </button>

            </form>
        </div>
    </div>
    
    </>

}
