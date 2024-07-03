import { useState , useEffect } from 'react'

import Image from 'next/image'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'
import validator from 'validator'

import { PlusIcon , MagnifyingGlassIcon , ChevronDoubleLeftIcon , ChevronLeftIcon , ChevronRightIcon , ChevronDoubleRightIcon , UserCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    query: any
    fields: any
    setFields: Function
    classes: any
    setClasses: Function
}

export default function ActionComposeAddContacts ( props: Props ): JSX.Element {

    const { query , fields , setFields , classes , setClasses } = props

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
    const [ search , setSearch ] = useState <string> ( '' ) // search value state.

    /* for DOM change states */
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ disabled , setDisabled ] = useState <boolean> ( false )

    const router = useRouter()

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
                command: 'search-contact',
                search: search,
                page: page
            } )

            await axios ( {
                signal: controller.signal,
                method: 'post',
                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/dashboard`,
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

                } else {

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

    } , [ page , search ] )

    return <>

    <div
        onMouseDown={ ( e: any ) => {
            /*
                this condition will check if the click event is executed
                to this element only with the id of "window" and 
                not the child elements.
            */
            e.target.id === 'window'
                &&  (
                        setClasses( { ... classes , contact: { display: 'flex' , opacity: 'opacity-0' , translate: 'translate-x-10' } } ),
                        setTimeout( () => setClasses( { ... classes , contact: { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-x-10' } } ) , 300 )
                    )
        } }
        id='window' //
        className={ `fixed z-50 left-0 top-0 right-0 bottom-0 justify-end bg-black/25 ${ classes.contact.display }` }
    >
        <div className={ `transition ease-in-out duration-300 ${ classes.contact.opacity } ${ classes.contact.translate }` }>

            <div className='flex flex-col space-y-3 bg-white w-[320px] h-screen p-5'>

                <div className='flex items-center justify-between w-full h-max'>
                    <h1 className='text-blue-600 text-lg font-open-sans-semibold capitalize'>add recipients</h1>
                    <button
                        onClick={ ( e: any ) => {
                            setClasses( { ... classes , contact: { display: 'flex' , opacity: 'opacity-0' , translate: 'translate-x-10' } } )
                            setTimeout( () => setClasses( { ... classes , contact: { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-x-10' } } ) , 300 )
                        } }
                        type='button'
                        className='border-transparent text-gray-950 border cursor-pointer outline-none rounded p-0.5 transition ease-in-out duration-300 hover:bg-gray-200'
                    >
                        <ChevronRightIcon className='h-4 w-4' />
                    </button>
                </div>
                
                <div className='grid gap-3 h-max'>
                    <form
                        onSubmit={ async ( e: any ) => {
                            e.preventDefault()
                            setSearch( e.target.search.value )
                        } }
                        typeof='submit'
                        className='block h-max'
                    >

                        <div className='relative flex items-center w-full'>
                            <input
                                type='text'
                                className='bg-gray-100 border-gray-100 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 pl-2 pr-10 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:cursor-default disabled:opacity-75 disabled:hover:border-gray-300 disabled:focus:border-gray-300'
                                id='search'
                                placeholder={ 'search' }
                                disabled={ disabled }
                            />
                            <button
                                type='submit'
                                className='absolute right-2 text-gray-500 cursor-pointer outline-none disabled:cursor-default'
                                disabled={ disabled }
                            >
                                <MagnifyingGlassIcon className='h-5 w-5' />
                            </button>
                        </div>

                    </form>

                    <table className='relative z-10 w-full'>

                        <thead className='sticky top-0 w-full bg-gray-100 text-xs'>

                            <tr className='border-gray-100 border-b'>
                                <th scope='col' className='p-2 h-10 w-[45%]'>

                                    <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-regular uppercase'>mobile no.</div>

                                </th>
                                <th scope='col' className='p-2 h-10 w-[45%]'>

                                    <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-regular uppercase'>name</div>

                                </th>
                                <th scope='col' className='p-2 h-10 w-[10%]'></th>
                            </tr>

                        </thead>

                        {
                                loading
                                    ?   <tbody className='relative -z-10 bg-white text-xs'>
                                            <tr className='border-gray-100 border-b'>
                                                
                                                <td scope='row' colSpan={ 3 } className='p-2'>
                                                    <svg className='h-5 w-5 text-gray-500' xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
                                                        <circle cx='4' cy='12' r='3' fill='currentColor'>
                                                            <animate id='svgSpinners3DotsScale0' attributeName='r' begin='0;svgSpinners3DotsScale1.end-0.25s' dur='0.75s' values='3;.2;3' />
                                                        </circle>
                                                        <circle cx='12' cy='12' r='3' fill='currentColor'>
                                                            <animate attributeName='r' begin='svgSpinners3DotsScale0.end-0.6s' dur='0.75s' values='3;.2;3' />
                                                        </circle>
                                                        <circle cx='20' cy='12' r='3' fill='currentColor'>
                                                            <animate id='svgSpinners3DotsScale1' attributeName='r' begin='svgSpinners3DotsScale0.end-0.45s' dur='0.75s' values='3;.2;3' />
                                                        </circle>
                                                    </svg>
                                                </td>

                                            </tr>
                                        </tbody>
                            :   loading || chunk.length === 0
                                    ?   <tbody className='relative -z-10 bg-white text-xs'>
                                            <tr className='border-gray-100 border-b'>
                                                
                                                <td scope='row' colSpan={ 3 } className='p-2'>
                                                    <div className='text-gray-900 font-open-sans-light text-xs'>no contacts found.</div>
                                                </td>

                                            </tr>
                                        </tbody>
                            :   <tbody className='relative -z-10 bg-white text-xs'>
                                    {
                                        chunk.map( ( obj: any , ind: number ) => (
                                            <tr key={ ind } className='border-gray-100 border-b'>
                                                <td scope='row' className='p-2 h-10 w-[45%]'>

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
                                                <td scope='row' className='p-2 h-10 w-[45%]'>

                                                    <div className='flex items-center justify-start h-full w-full'>
                                                        <span className='font-open-sans-light'>{ obj.owners_name }</span>
                                                    </div>

                                                </td>
                                                <td scope='row' className='p-2 h-10 w-[10%]'>
                                                    
                                                    <div className='flex items-center justify-start h-full w-full'>
                                                        <button
                                                            onClick={ ( e: any ) => {
                                                                setFields( { ... fields , contactno: fields.contactno + `${ fields.contactno === '' ? '' : ',' }${ obj.mobile_no.replace( /^\+63/g , '0' ) }` } )
                                                            } }
                                                            type='button'
                                                            className='text-gray-950 cursor-pointer outline-none disabled:opacity-75 disabled:cursor-default'
                                                            disabled={ disabled }
                                                        >
                                                            <div
                                                                className='block'
                                                            > 
                                                                <PlusIcon className='h-4 w-4' />
                                                            </div>
                                                        </button>
                                                    </div>

                                                </td>
                                            </tr>
                                        ) )
                                    }
                                </tbody>
                        }

                    </table>

                    <div className='flex items-center justify-center'>

                        <div className='flex space-x-1 items-center'>
                            
                            <button
                                onClick={ ( e: any ) => {
                                    setPage( 1 )
                                    router.push( `/dashboard?token=${ query.token }&pg=${ 1 }` )
                                } }
                                type='button'
                                className={ `flex items-center justify-center text-gray-700 ${ page === 1 || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-5 w-5 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                            >
                                <ChevronDoubleLeftIcon className='h-5 w-5' />
                            </button>

                            <button
                                onClick={ ( e: any ) => {
                                    setPage( page - 1 )
                                    router.push( `/dashboard?token=${ query.token }&pg=${ page - 1 }` )
                                } }
                                type='button'
                                className={ `flex items-center justify-center text-gray-700 ${ page === 1 || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-5 w-5 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                            >
                                <ChevronLeftIcon className='h-5 w-5' />
                            </button>

                            {
                                instance.map( ( arr: any , ind: number ) => (
                                    
                                    <button
                                        key={ ind }
                                        onClick={ ( e: any ) => {
                                            setPage( ind + 1 )
                                            router.push( `/dashboard?token=${ query.token }&pg=${ ind + 1 }` )
                                        } }
                                        type='button'
                                        /*
                                            this will highlight the "Link" if
                                            the current page is equal to current index.
                                        */
                                        className={ `flex items-center justify-center ${ page === ind + 1 ? 'bg-blue-200' : '' } text-gray-700 text-sm cursor-pointer font-open-sans-semibold outline-none h-5 w-5 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                                    >
                                        { ind + 1 }
                                    </button>
                                    
                                    /*
                                        if the current page is greater than equal to '5'
                                        change the splice start to the current page and ends to '5',
                                        if not change the splice start to '0' and ends to '5'

                                        this will only show '5' buttons at max and prevents showing
                                        multiple buttons if the chunk index is large 
                                    */

                                ) ).splice( Number( page ) >= 5 ? Number( page ) - 2 : 0 , 5 )
                            }

                            <button
                                onClick={ ( e: any ) => {
                                    setPage( page + 1 )
                                    router.push( `/dashboard?token=${ query.token }&pg=${ page + 1 }` )
                                } }
                                type='button'
                                className={ `flex items-center justify-center text-gray-700 ${ page === length || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-5 w-5 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                            >
                                <ChevronRightIcon className='h-5 w-5' />
                            </button>

                            <button
                                onClick={ ( e: any ) => {
                                    setPage( length )
                                    router.push( `/dashboard?token=${ query.token }&pg=${ length }` )
                                } }
                                type='button'
                                className={ `flex items-center justify-center text-gray-700 ${ page === length || chunk.length === 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer' } outline-none h-5 w-5 p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200` }
                            >
                                <ChevronDoubleRightIcon className='h-5 w-5' />
                            </button>

                        </div>

                    </div>
                </div>

            </div>

        </div>
    </div>
    
    </>

}
