import { useState , useEffect , useRef } from 'react'

import Link from 'next/link'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'
import validator from 'validator'

import { ChevronDoubleLeftIcon , ChevronLeftIcon , ChevronRightIcon , ChevronDoubleRightIcon } from '@heroicons/react/20/solid'

import ActionSentSearch from './action-sent-search'
import ActionSentDelete from './action-sent-delete'
import ListSent from './list-sent'

interface Props {
    query: any
    priviledges: any
}

export default function TableSent ( props: Props ): JSX.Element {

    const {
        query,
        priviledges: { priviledges: { sent_del } }
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

    /* for checkboxes */
    const all = useRef <any> ( null )                                           // check all ref.
    const one = useRef <any> ( null )                                           // check one ref.

    /* for search */
    const [ search , setSearch ] = useState <string> ( '' )                     // search value state.

    /* for DOM change states */
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ disabled , setDisabled ] = useState <boolean> ( false )

    /* enable and disabled delete if "checkbox" state is true */
    const [ menu , setMenu ] = useState <boolean> ( true )

    /* check if queue folder contains files */
    const [ checkQueue , setCheckQueue ] = useState <boolean> ( false )

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
                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/sent`,
                data: { payload: encrypt },
                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
            } )
            .then ( ( res: any ) => {

                if ( res.status === 200 ) {

                    const { chunk , length , queue } = res.data

                    setCheckQueue( queue )

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
                    <ActionSentDelete
                        query={ query } // for delete, reloading to non-existing page can cause error.
                        all={ all }     // for checkbox.
                        menu={ menu }   // enable and disable "menu" state.
                        sent_del={ sent_del }   // for priviledges.
                        disabled={ disabled }
                    />
                </div>
                <div className='sm:hidden text-xs font-open-sans-light uppercase'>page <span className='text-blue-500 font-open-sans-bold'>{ page }</span> out of <span className='text-blue-500 font-open-sans-bold'>{ loading ? '...' : length }</span><span className='font-open-sans-light'>{ loading ? '' : length <= 1 ? ' page' : ' pages' }</span></div>
            </div>

            <ActionSentSearch
                setSearch={ setSearch }
                disabled={ disabled }
            />

        </div>

        <div className='border-gray-100 border-2 rounded-lg h-[580px] overflow-y-auto w-full'>

            <table className='relative z-10 w-full'>

                <thead className='sticky top-0 w-full bg-gray-100 text-xs'>

                    <tr className='border-gray-100 border-b'>
                        <th scope='col' className='p-2 h-10 w-10'>

                            <div className='flex items-center justify-center h-full w-full'>
                                {
                                    checkQueue || chunk.length === 0
                                        ?   <input
                                                type='checkbox'
                                                className='cursor-pointer outline-none disabled:opacity-75 disabled:cursor-default'
                                                disabled={ true }
                                            />
                                        :   <input
                                                // for check one update.
                                                ref={ one }
                                                // for check all update.
                                                onChange={ ( e: any ) => {
            
                                                    /*
                                                        these will "check" and "un-check" all the "checkboxes"
                                                        inside the "tbody" element with ref "all"
                                                    */
                                                    all.current.childNodes.forEach( ( elem: any ) => {
                                                        // set "menu" state.
                                                        setMenu( !e.target.checked )
            
                                                        e.target.checked
                                                                // this target the "tr" element with the "list" id
                                                            ?   elem.id === 'list' && ( elem.firstChild.firstChild.firstChild.checked = true )
                                                            :   elem.id === 'list' && ( elem.firstChild.firstChild.firstChild.checked = false )
                                                    } )
            
                                                } }
                                                type='checkbox'
                                                id='select_all'
                                                className='cursor-pointer outline-none disabled:opacity-75 disabled:cursor-default'
                                                // disable if the length is "0"
                                                disabled={ disabled || length === 0 || sent_del ? false : true }
                                            />
                                }
                            </div>

                        </th>
                        <th scope='col' className='p-2 h-10 w-28'>
                            <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-regular uppercase'>send to</div>
                        </th>
                        <th scope='col' className='p-2 h-10 w-44'>
                            <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-regular uppercase'>datetime</div>
                        </th>
                        <th scope='col' className='p-2 h-10 w-max hidden md:table-cell'>
                            <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-regular uppercase'>message</div>
                        </th>
                        <th scope='col' className='p-2 h-10 w-10'>
                        </th>
                    </tr>

                </thead>

                {
                        loading
                            ?   <tbody className='relative -z-10 bg-white text-xs'>
                                    <tr className='border-gray-100 border-b'>
                                        
                                        <td scope='row' colSpan={ 5 } className='p-2'>
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
                                        </td>

                                    </tr>
                                </tbody>
                    :   loading || chunk.length === 0
                            ?   <tbody className='relative -z-10 bg-white text-xs'>
                                    <tr className='border-gray-100 border-b'>
                                        
                                        <td scope='row' colSpan={ 5 } className='p-2'>
                                            {
                                                length === 0
                                                    ?   checkQueue
                                                            ?   <div className='grid gap-2'>
                                                                    <span className='text-gray-900 font-open-sans-light text-xs'>
                                                                        sent message cannot display at this moment since some messages are not successfully sent, please check the following.
                                                                    </span>
                                                                    <div className='block'>
                                                                        <div className='text-gray-900 font-open-sans-light text-xs'>
                                                                            <span>* check if your SIM subscription is already expired.</span>
                                                                        </div>
                                                                        <div className='text-gray-900 font-open-sans-light text-xs'>
                                                                            <span>* delete all the messages in the<Link href={ `/dashboard/queues?token=${ query.token }` } className='mx-1 text-blue-600 font-open-sans-semibold'>queues</Link>page.</span>
                                                                        </div>
                                                                        <div className='text-gray-900 font-open-sans-light text-xs'>
                                                                            <span>* check if the GSM module is working properly indicating a blinking LED light.</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            :   <div className='flex items-center space-x-1 text-gray-900 font-open-sans-light text-xs'>no sent messages! <Link href={ `/dashboard?token=${ query.token }` } className='mx-1 text-blue-600 font-open-sans-semibold'>send</Link> one now!</div>
                                                    :   <div className='flex items-center space-x-1 text-gray-900 font-open-sans-light text-xs'>page not existed</div>
                                            }
                                        </td>

                                    </tr>
                                </tbody>
                    :   <tbody
                            // for checkbox.
                            ref={ all }
                            className='relative -z-10 bg-white text-xs'
                        >
                            {
                                chunk.map( ( obj: any , ind: number ) => (
                                    <ListSent
                                        key={ ind }             // key for .map() method.

                                        disabled={ disabled }
                                        obj={ obj }

                                        one={ one }             // for checkbox.
                                        all={ all }             // for checkbox.

                                        sent_del={ sent_del }   // for priviledges.

                                        setMenu={ setMenu }     // enable and disable "menu" state.
                                    />
                                ) )
                            }
                        </tbody>
                }

            </table>

        </div>

        <div className='flex items-center justify-center sm:justify-between'>

            <div className='hidden sm:block text-xs font-open-sans-light uppercase'>page <span className='text-blue-500 font-open-sans-bold'>{ page }</span> out of <span className='text-blue-500 font-open-sans-bold'>{ loading ? '...' : length }</span><span className='font-open-sans-light'>{ loading ? '' : length <= 1 ? ' page' : ' pages' }</span></div>

            <div className='flex space-x-1 items-center'>
                
                <Link
                    onClick={ ( e: any ) => setPage( 1 ) }
                    href={ `/dashboard/sent?token=${ query.token }&pg=${ 1 }` }
                    className={ `flex items-center justify-center text-gray-700 ${ page === 1 || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                >
                    <ChevronDoubleLeftIcon className='h-5 w-5' />
                </Link>
                <Link
                    onClick={ ( e: any ) => setPage( page - 1 ) }
                    href={ `/dashboard/sent?token=${ query.token }&pg=${ page - 1 }` }
                    className={ `flex items-center justify-center text-gray-700 ${ page === 1 || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                >
                    <ChevronLeftIcon className='h-5 w-5' />
                </Link>
                {
                    instance.map( ( arr: any , ind: number ) => (                    
                        <Link
                            key={ ind }
                            onClick={ ( e: any ) => setPage( ind + 1 ) }
                            href={ `/dashboard/sent?token=${ query.token }&pg=${ ind + 1 }` }
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
                    href={ `/dashboard/sent?token=${ query.token }&pg=${ page + 1 }` }
                    className={ `flex items-center justify-center text-gray-700 ${ page === length || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                >
                    <ChevronRightIcon className='h-5 w-5' />
                </Link>
                <Link
                    onClick={ ( e: any ) => setPage( length ) }
                    href={ `/dashboard/sent?token=${ query.token }&pg=${ length }` }
                    className={ `flex items-center justify-center text-gray-700 ${ page === length || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-7 w-7 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                >
                    <ChevronDoubleRightIcon className='h-5 w-5' />
                </Link>

            </div>

        </div>

    </div>

    </>

} 
