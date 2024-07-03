import { useState , useEffect } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import swal from 'sweetalert'
import OutsideClickHandler from 'react-outside-click-handler'

import { ArrowUpRightIcon , ChevronDownIcon , CheckCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    query: any
    all: any
    menu: boolean
    contacts_add: boolean
    disabled: boolean
}

export default function ActionContactsMove ( props: Props ): JSX.Element {

    const { all , menu , contacts_add , disabled } = props

    type Classes = { display: string }
    const [ classes , setClasses ] = useState <Classes> ( { display: 'hidden' } )

    type Fields = { group_id: string }
    const [ fields , setFields ] = useState <Fields> ( { group_id: '' } )

    type Gids = { gid: string , name: string }
    const [ gids , setGids ] = useState <Array<Gids>> ( [] )

    const [ selfDIs , setSelfDIs ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )

    const router = useRouter()

    useEffect ( () => {

        const controller = new AbortController()

        const createEncryptedPayload = new CreateEncryptedPayload()
        const generateSerial = new GenerateSerial()

        get( controller )

        async function get ( controller: any ) {

            setSelfDIs( true )
            setLoading( true )

            const serial: string = String( generateSerial.keyCode() )
            const encrypt: string = createEncryptedPayload.wrap( {
                serial: serial,
                command: 'groupid'
            } )

            await axios ( {
                signal: controller.signal,
                method: 'post',
                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/contacts`,
                data: { payload: encrypt },
                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
            } )
            .then ( ( res: any ) => {

                if ( res.status === 200 ) {

                    setGids( res.data )

                    setTimeout( () => {
                        setSelfDIs( false )
                        setLoading( false )
                    } , 500 )

                }

            } )
            .catch ( ( err: any ) => {

                if ( err ) {

                    console.error( err.message )

                    setTimeout( () => {
                        setSelfDIs( false )
                        setLoading( false )
                    } , 500 )

                }

            } )

        }

        return () => controller.abort()

    } , [] )

    return <>

    <div className='relative'>

        <button
            onClick={ ( e: any ) => {
                setClasses( { display: 'flex' } )
            } }
            type='button'
            className='text-gray-700 cursor-pointer outline-none p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200 hover:text-blue-500 disabled:opacity-75 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-gray-700'
            disabled={ menu || disabled || selfDIs || !contacts_add }
        >
            <ArrowUpRightIcon className='h-4 w-4' />
        </button>

        <OutsideClickHandler
            onOutsideClick={ ( e: any ) => {
                setClasses( { display: 'hidden' } )
            } }
        >
            <div className={ `${ classes.display } absolute z-40 top-8 bg-stone-100 shadow-black/25 shadow-md drop-shadow-md rounded w-72 p-3 transition ease-in-out duration-300` }>
                <form
                    onSubmit={ ( e: any ) => {

                        e.preventDefault()

                        // array container.
                        let cids: number[] = []

                        all.current.childNodes.forEach( ( elem: any ) => {
                            // this target the "tr" element with the "list" id
                            elem.id === 'list'
                                // if the current "checkbox" is "true"
                                &&  elem.firstChild.firstChild.firstChild.checked
                                        // append the "id" of that checkbox
                                        &&  cids.push( elem.firstChild.firstChild.firstChild.id )
                        } )

                        swal ( {
                            title: `move contacts to group [${ fields.group_id === '' ? '?' : fields.group_id }].`,
                            text: `[${ cids.length }] item(s) selected.`,
                            icon: 'warning'
                        } )
                        .then( async ( del ) => {

                            if ( del ) {
            
                                const createEncryptedPayload = new CreateEncryptedPayload()
                                const generateSerial = new GenerateSerial()
            
                                const serial: string = String( generateSerial.keyCode() )
                                const encrypt: string = createEncryptedPayload.wrap( {
                                    serial: serial,
                                    command: 'move',
                                    gid: fields.group_id,
                                    cids: cids,
                                } )
            
                                await axios ( {
                                    method: 'post',
                                    url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/contacts`,
                                    data: { payload: encrypt },
                                    headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                                } )
                                .then ( ( res: any ) => {

                                    const { pass , msg } = res.data

                                    if ( pass ) {

                                        swal( {
                                            title: 'done.',
                                            text: '',
                                            icon: 'success'
                                        } )
                                        .then ( ok => {
    
                                            if ( ok ) {
                                                router.reload()
                                            }
                
                                        } )

                                    }

                                    else {

                                        swal( {
                                            title: '',
                                            text: msg,
                                            dangerMode: true
                                        } )

                                    }
            
                                
                                } )
                                .catch( ( err: any ) => {
            
                                    if ( err ) {

                                        console.error( err.message )
                                        
                                        swal ( {
                                            title: '',
                                            text: `an error occured.`,
                                            icon: 'warning',
                                            dangerMode: true,
                                        } )

                                    }
            
                                } )
            
                            }
            
                        } )

                    } }
                    typeof='submit'
                    className='grid w-full'
                >

                    <div className='flex flex-col space-y-2'>
                        <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>move to group</label>
                        <div className='flex item space-x-2'>

                            <div className='relative z-10 flex items-center w-full'>
                                <input
                                    type='text'
                                    onChange={ ( e: any ) => {
                                        setFields( { ... fields , group_id: e.target.value } )
                                    } }
                                    className={ `bg-transparent border-gray-300 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 px-2 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:opacity-75 disabled:cursor-default disabled:hover:border-gray-100 disabled:focus:border-gray-100` }
                                    name='gid'
                                    id='gid'
                                    autoComplete='off'
                                    list='list2'
                                    placeholder='enter or select group id'
                                    disabled={ menu || disabled || selfDIs || contacts_add ? false : true }
                                />
                                <datalist id='list2' >
                                    {
                                        gids.map( ( arr: any , ind: number ) => (
                                            <option key={ ind } value={ arr.gid }>{ arr.name }</option>
                                        ) )
                                    }
                                </datalist>
                                <div className='absolute -z-10 right-2'>
                                    <ChevronDownIcon className='text-blue-500 h-4 w-4' />
                                </div>
                            </div>

                            <button
                                type='submit'
                                className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-xs uppercase cursor-pointer outline-none p-0.5 w-16 rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                                disabled={ menu || disabled || selfDIs || contacts_add ? false : true }
                            >
                                {
                                    loading
                                        ?   <span>...</span>
                                        :   pass
                                                ?   <CheckCircleIcon className='h-5 w-5' />
                                                :   'move'
                                }
                            </button>

                        </div>
                    </div>

                </form>
            </div>
        </OutsideClickHandler>

    </div>

    
    
    </>

}
