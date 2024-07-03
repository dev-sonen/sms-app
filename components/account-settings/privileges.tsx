import { useState , useEffect } from 'react'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import UsersList from './users-list'
import UsersDetails from './users-details'

import UsersSearch from './users-search'

interface Props {
    user: any
}

export default function Privileges ( props: Props ): JSX.Element {

    const { user } = props

    type Users = { account: string , username: string , name: string , image: string }
    const [ users , setUsers ] = useState <Array<Users>> ( [] )

    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )

    const [ search , setSearch ] = useState <string> ( '' )

    useEffect ( () => {

        const controller = new AbortController()

        const createEncryptedPayload = new CreateEncryptedPayload()
        const generateSerial = new GenerateSerial()

        if ( user.role === 'admin' ) {
            get( controller )
        }

        async function get ( controller: any ) {

            setDisabled( true )
            setLoading( true )

            const serial: string = String( generateSerial.keyCode() )
            const encrypt: string = createEncryptedPayload.wrap( { serial: serial , role: user.role , command: 'search' , search: search } )

            await axios ( {
                signal: controller.signal,
                method: 'post',
                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/account-settings-privileges`,
                data: { payload: encrypt },
                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
            } )
            .then ( ( res: any ) => {

                if ( res.status === 200 ) {

                    // data state must be set first before finishing the UI disabled and loading state.
                    setUsers( res.data )
                    
                    setTimeout( () => {
                        setDisabled( false )
                        setLoading( false )
                    } , 500 )

                } else {

                    // data state must be set first before finishing the UI disabled and loading state.
                    setUsers( [] )

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

    } , [ user.role , search ] )

    if ( user.role === 'admin' ) {

        return <>
    
        <div className='grid gap-5 p-5 md:p-10'>
    
            <div className='flex flex-col space-y-5'>
                <div className='grid gap-3 lg:gap-0 lg:grid-cols-2'>
                    <div className='text-blue-600 text-xl font-open-sans-medium uppercase'>list of accounts</div>
                    <UsersSearch
                        setSearch={ setSearch }
                        disabled={ disabled }
                    />
                </div>
                
                <div className='border-gray-100 border-2 rounded-lg h-[600px] overflow-y-auto w-full'>
                    <table className='relative z-10 w-full'>
    
                        <thead className='sticky top-0 w-full bg-gray-100 text-xs'>
    
                            <tr className='border-gray-100 border-b'>
                                <th scope='col' className='p-2 h-10 lg:w-36'>
    
                                    <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-regular uppercase'>username</div>
    
                                </th>
                                <th scope='col' className='p-2 h-10 w-5 lg:w-auto'>
    
                                    <div className='hidden lg:flex items-center justify-start h-full text-gray-800 font-open-sans-regular uppercase'>account id</div>
    
                                </th>
                                <th scope='col' className='p-2 h-10 w-10 lg:w-20'>
    
                                    <div className='flex items-center justify-end h-full text-gray-800 font-open-sans-regular uppercase'>actions</div>
    
                                </th>
                            </tr>
    
                        </thead>
    
                        {
                                loading
                                    ?   <tbody className='relative -z-10 bg-white text-xs'>
                                            <tr className='border-gray-100 border-b'>
                                                
                                                <td scope='row' colSpan={ 3 } className='p-2'>
                                                    <div className='text-gray-900 font-open-sans-light text-xs'>loading...</div>
                                                </td>
    
                                            </tr>
                                        </tbody>
                            :   loading || users.length === 0
                                    ?   <tbody className='relative -z-10 bg-white text-xs'>
                                            <tr className='border-gray-100 border-b'>
    
                                                <td scope='row' colSpan={ 3 } className='p-2'>
                                                    <div className='text-gray-900 font-open-sans-light text-xs'>there are no current registered users.</div>
                                                </td>
    
                                            </tr>
                                        </tbody>
                                    :   users.map( ( obj: Users , ind: number ) => (
                                            <tbody key={ ind } className='relative -z-10 bg-white text-xs'>
                                                <tr className='border-gray-100 border-b'>
                                                    <UsersList
                                                        obj={ obj }
                                                        disabled={ disabled }
                                                    />
                                                </tr>
                                                <tr className='border-gray-100 border-b transition-all ease-in-out duration-300' style={ { display: 'none' } }>
                                                    <UsersDetails
                                                        obj={ obj }
                                                        disabled={ disabled }
                                                    />
                                                </tr>
                                            </tbody>
                                        ) )
                        }
    
                    </table>
                </div>
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
