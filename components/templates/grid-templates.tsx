import { useState , useEffect } from 'react'

import Link from 'next/link'

import ActionTemplatesSearch from './action-templates-search'
import ActionTemplatesAdd from './action-templates-add'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'
import validator from 'validator'

import { PlusIcon , ChevronDoubleLeftIcon , ChevronLeftIcon , ChevronRightIcon , ChevronDoubleRightIcon } from '@heroicons/react/20/solid'
import CardTemplates from './card-templates'

interface Props {
    query: any
    priviledges: any
}

export default function GridTemplates ( props: Props ): JSX.Element {

    const {
        query,
        priviledges: { priviledges: { template_create , template_edit , template_del } }
    } = props

    /*
        "pg" stands for "page" this query will be used when
        navigating through pages using pagination, and if 
        any instances of "pg" will result to the following.
        
        - undefined
        - blank
        - less than or equal to zero
        - alpha characters intead of numeric

        "pg" will always result to "1" these will prevent the query
        to break if illegal values are passed in the url 
    */
    const pg: number = query.pg && validator.isNumeric( query.pg , { no_symbols: true } ) && query.pg !== '0' ? Number( query.pg ) : 1

    /* for pagination */
    const [ chunk , setChunk ] = useState <Array<any>> ( [] )                   // current page of the chunk.
    const [ instance , setInstance ] = useState <Array<any>> ( [] )             // number of instance of pages.
    const [ length , setLength ] = useState <number> ( 0 )                      // length of the chunk.
    const [ page , setPage ] = useState <number> ( pg )                         // page navigation.

    /* for search */
    const [ search , setSearch ] = useState <string> ( '' )                     // search value state.

    /* for DOM change states */
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ disabled , setDisabled ] = useState <boolean> ( false )

    /* data call */
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
                command: 'search',
                search: search,
                page: page
            } )

            await axios ( {
                signal: controller.signal,
                method: 'post',
                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/templates`,
                data: { payload: encrypt },
                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
            } )
            .then ( ( res: any ) => {

                if ( res.status === 200 ) {

                    const { chunk , length } = res.data

                    const createIndex: Function = ( length: number ): Array<string> => {
                        let cont: Array<string> = []
                        for ( let i = 0 ; i < length ; i ++ ) { cont.push( 'chunk' ) }
                        return cont
                    }

                    setChunk( chunk ? chunk : [] )
                    setInstance( createIndex( length ) )
                    setLength( length )

                    setTimeout( () => {
                        setDisabled( false )
                        setLoading( false )
                    } , 500 )

                }

                else {

                    setTimeout( () => {
                        setDisabled( false )
                        setLoading( false )
                    } , 500 )

                }

            } )
            .catch( ( err: any ) => {

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

    } , [ page , search ] )
    
    return <>

    <div className='grid p-5 gap-3 md:p-10'>

        <div className='grid gap-3 sm:gap-0 sm:grid-cols-2 items-center'>

            <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                    <ActionTemplatesAdd
                        template_create={ template_create }
                    />
                </div>
                <div className='sm:hidden text-xs font-open-sans-light uppercase'>page <span className='text-blue-500 font-open-sans-bold'>{ page }</span> out of <span className='text-blue-500 font-open-sans-bold'>{ loading ? '...' : length }</span><span className='font-open-sans-light'>{ loading ? '' : length <= 1 ? ' page' : ' pages' }</span></div>
            </div>

            <ActionTemplatesSearch
                setSearch={ setSearch }
                disabled={ disabled }
            />
            
        </div>

        <div className='w-full min-h-[620px]'>
            {
                    loading
                        ?   <div className='flex items-center justify-center w-full h-96 lg:h-full'>
                                <svg className='h-4 w-4 text-gray-500' xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                    <circle cx="4" cy="12" r="3" fill="currentColor">
                                        <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3" />
                                    </circle>
                                    <circle cx="12" cy="12" r="3" fill="currentColor">
                                        <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3" />
                                    </circle>
                                    <circle cx="20" cy="12" r="3" fill="currentColor">
                                        <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3" />
                                    </circle>
                                </svg>
                            </div>

                :   loading || chunk.length === 0
                        ?   <div className='flex items-center justify-center w-full h-full'>
                                {
                                    length === 0
                                        ?   <div className='flex items-center space-x-1 text-gray-900 font-open-sans-light text-xs'><span>click the</span><span className='bg-green-100 text-green-500 p-0.5 rounded-full'><PlusIcon className='h-3 w-3' /></span><span>icon to create a template.</span></div>
                                        :   <div className='flex items-center space-x-1 text-gray-900 font-open-sans-light text-xs'>page not existed</div>
                                }
                            </div>

                :   <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 place-content-center'>
                        {
                            chunk.map( ( obj: any , ind: number ) => (
                                <CardTemplates
                                    key={ ind }
                                    obj={ obj }
                                    query={ query }
                                    template_edit={ template_edit }
                                    template_del={ template_del }
                                />
                            ) )
                        }
                    </div>
            }
        </div>

        <div className='flex items-center justify-center sm:justify-between'>

            <div className='hidden sm:block text-xs font-open-sans-light uppercase'>page <span className='text-blue-500 font-open-sans-bold'>{ page }</span> out of <span className='text-blue-500 font-open-sans-bold'>{ loading ? '...' : length }</span><span className='font-open-sans-light'>{ loading ? '' : length <= 1 ? ' page' : ' pages' }</span></div>

            <div className='flex space-x-1 items-center'>
                
                <Link
                    onClick={ ( e: any ) => setPage( 1 ) }
                    href={ `/dashboard/templates?token=${ query.token }&pg=${ 1 }` }
                    className={ `flex items-center justify-center text-gray-700 ${ page === 1 || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                >
                    <ChevronDoubleLeftIcon className='h-5 w-5' />
                </Link>
                <Link
                    onClick={ ( e: any ) => setPage( page - 1 ) }
                    href={ `/dashboard/templates?token=${ query.token }&pg=${ page - 1 }` }
                    className={ `flex items-center justify-center text-gray-700 ${ page === 1 || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                >
                    <ChevronLeftIcon className='h-5 w-5' />
                </Link>
                {
                    instance.map( ( arr: any , ind: number ) => (                    
                        <Link
                            key={ ind }
                            onClick={ ( e: any ) => setPage( ind + 1 ) }
                            href={ `/dashboard/templates?token=${ query.token }&pg=${ ind + 1 }` }
                            /*
                                this will highlight the "Link" if
                                the current page is equal to current index.
                            */
                            className={ `flex items-center justify-center ${ page === ind + 1 ? 'bg-blue-200' : '' } text-gray-700 cursor-pointer font-open-sans-semibold outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                        >
                            { ind + 1 }
                        </Link>
                        /*
                            if the current page is greater than equal to '5'
                            change the splice start to the current page and ends to '5',
                            if not change the splice start to '0' and ends to '5'

                            this will only show '5' buttons at max and prevents showing
                            multiple buttons if the chunk index is large 
                        */
                    ) ).splice( Number( page ) >= 5 ? Number( page ) - 2 : 0 , 5 )
                }
                <Link
                    onClick={ ( e: any ) => setPage( page + 1 ) }
                    href={ `/dashboard/templates?token=${ query.token }&pg=${ page + 1 }` }
                    className={ `flex items-center justify-center text-gray-700 ${ page === length || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                >
                    <ChevronRightIcon className='h-5 w-5' />
                </Link>
                <Link
                    onClick={ ( e: any ) => setPage( length ) }
                    href={ `/dashboard/templates?token=${ query.token }&pg=${ length }` }
                    className={ `flex items-center justify-center text-gray-700 ${ page === length || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                >
                    <ChevronDoubleRightIcon className='h-5 w-5' />
                </Link>

            </div>

        </div>

    </div>

    </>

}
