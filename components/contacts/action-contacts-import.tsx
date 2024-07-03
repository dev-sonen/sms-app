import { useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import Papa from 'papaparse'

import { CheckCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    contacts_add: boolean
}

export default function ActionContactsImport ( props: Props ): JSX.Element {

    const { contacts_add } = props

    const [ obj , setObj ] = useState <Array<any>> ( [] )

    type Warning = { file: string , data: string[] }
    const [ warning , setWarning ] = useState <Warning> ( { file: '' , data: [] } )

    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass, setPass ] = useState <boolean> ( false )

    const router = useRouter()

    return <>
    
    <div className='block'>

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
                    command: 'import',
                    obj: obj
                } )

                await axios ( {
                    method: 'post',
                    url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/contacts`,
                    data: { payload: encrypt },
                    headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                } )
                .then ( ( res: any ) => {

                    if ( res.status === 200 ) {

                        const { list } = res.data

                        setTimeout( () => {

                            if ( list.pass ) {

                                // setDisabled( false ) //
                                setLoading( false )

                                setPass( true )
                                setTimeout( () => router.reload() , 1000 )

                            } else {

                                setDisabled( false )
                                setLoading( false )
    
                                setPass( false )
                                setWarning( { ... warning , data: list.msg } )

                            }

                        } , 500 )

                    }

                    else {

                        setTimeout( () => {

                            setDisabled( false )
                            setLoading( false )

                            setPass( false )
                            setWarning( { file: 'an error occurred.' , data: [ 'an error occurred.' ] } )

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
                            setWarning( { file: 'an error occurred.' , data: [ 'an error occurred.' ] } )

                        } , 500 )

                    }

                } )

            } }
            typeof='submit'
            className='grid gap-3'
        >
            <div className='flex flex-col space-y-1'>
                <div className='flex flex-col space-y-2'>
                    <div className='flex items-center space-x-4 w-full'>
                        <input
                            type='file'
                            accept='.csv'
                            onChange={ ( e: any ) => setWarning( { file: '' , data: [] } ) }
                            className='flex bg-gray-200 font-open-sans-regular text-xs cursor-pointer outline-none rounded py-1 w-full disabled:cursor-default disabled:opacity-75'
                            id='upload'
                            disabled={ disabled || contacts_add ? false : true }
                        />
                        <button
                            onClick={ async ( e: any ) => {

                                setLoading( true )
                                setDisabled( true )

                                setWarning( { file: '' , data: [] } )

                                setTimeout( () => {

                                    const file: any = e.target.parentNode.firstChild.files[ 0 ]
                                    
                                    // check if "file.type" is "text/csv"
                                    if ( file && file.type === 'text/csv' ) {

                                        Papa.parse( file , { 
                                            header: true,
                                            complete: function ( res ) {
                                                /*
                                                    check if all the properties are presented
                                                    and all if all properties are ""
                                                    to avoid "undefined" values.
                                                */
                                                const data: any[] = res.data.filter( ( arr: any ) => arr.hasOwnProperty( 'mobile_no' ) && arr.hasOwnProperty( 'owners_name' ) && arr.hasOwnProperty( 'group_id' ) ).filter( ( arr: any ) => arr.mobile_no !== '' || arr.owners_name !== '' || arr.group_id !== '' )
                                                
                                                setObj( data )
                                            }
                                        } )

                                        setLoading( false )
                                        setDisabled( false )

                                    } else {

                                        setWarning( { file: 'no file selected, please select a .csv file format.' , data: [] } )
                                        
                                        setObj( [] )

                                        setLoading( false )
                                        setDisabled( false )

                                    }
                                    
                                } , 1000 )
                                
                            } }
                            type='button'
                            className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-xs uppercase cursor-pointer outline-none p-1 sm:w-24 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                            disabled={ disabled || contacts_add ? false : true }
                        >
                            {
                                loading
                                    ?   <span>...</span>
                                    :   pass
                                            ?   <CheckCircleIcon className='h-4 w-4' />
                                            :   'generate'
                            }
                        </button>
                    </div>
                    <div className='font-open-sans-regular text-red-500 italic text-xs h-4'>{ warning.file }</div>
                </div>
            </div>
            
            <div className='grid gap-2 w-full'>
                <div className='border-gray-100 border rounded-lg h-64 overflow-y-auto w-full'>
                    <table className='relative z-10 w-full'>
                        <thead className='sticky top-0 w-full bg-gray-100 text-xs'>
                            <tr className='border-gray-100 border-b'>
                                <th scope='col' className='p-2 h-10'>
                                    <div className='text-left font-open-sans-regular uppercase'>mobile no.</div>
                                </th>
                                <th scope='col' className='p-2 h-10'>
                                    <div className='text-left font-open-sans-regular uppercase'>name</div>
                                </th>
                                <th scope='col' className='p-2 h-10'>
                                    <div className='text-left font-open-sans-regular uppercase'>group id</div>
                                </th>
                            </tr>
                        </thead>
                        {
                                loading
                                    ?   <tbody className='relative -z-10 bg-white text-xs'>
                                            <tr className='border-gray-100 border-b'>
                                                
                                                <td scope='row' colSpan={ 3 } className='p-2'>
                                                    <div className='text-gray-900 font-open-sans-light text-xs'>...</div>
                                                </td>

                                            </tr>
                                        </tbody>
                            :   loading || obj.length === 0
                                    ?   <tbody className='relative -z-10 bg-white text-xs'>
                                            <tr className='border-gray-100 border-b'>
                                                
                                                <td scope='row' colSpan={ 3 } className='p-2'>
                                                    <div className='text-gray-900 font-open-sans-light text-xs'>no data.</div>
                                                </td>

                                            </tr>
                                        </tbody>                        
                            :   <tbody className='relative -z-10 w-full bg-white text-xs'>
                                    {
                                        obj.map( ( arr: any , ind: number ) => (
                                            <tr key={ ind } className='border-gray-100 border-b'>
                                                <td scope='row' className='p-2 h-10'>
                                                    <div className='text-left font-open-sans-light uppercase'>{ arr.mobile_no }</div>
                                                </td>
                                                <td scope='row' className='p-2 h-10'>
                                                    <div className='text-left font-open-sans-light uppercase'>{ arr.owners_name }</div>
                                                </td>
                                                <td scope='row' className='p-2 h-10'>
                                                    <div className='text-left font-open-sans-light uppercase'>{ arr.group_id }</div>
                                                </td>
                                            </tr>
                                        ) )
                                    }
                                </tbody>
                        }
                    </table>
                </div>
                {
                    warning.data.map( ( arr: string , ind: number ) => (
                        <div key={ ind } className='font-open-sans-regular text-red-500 italic text-xs h-4'>* { arr }</div>
                    ) )
                }
            </div>
            
            <div className='flex justify-end'>
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
                                    :   'import'
                    }
                </button>
            </div>

        </form>

    </div>
    
    </>

}
