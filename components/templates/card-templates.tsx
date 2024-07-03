import { useState , useRef } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import swal from 'sweetalert'

import colorParser from '@/helpers/parse-color'

import { ChevronRightIcon ,  PencilIcon , TrashIcon } from '@heroicons/react/20/solid'

interface Props {
    obj: any
    query: any
    template_edit: boolean
    template_del: boolean
}

export default function CardTemplates ( props: Props ): JSX.Element {

    const { obj , query , template_edit , template_del } = props

    /* sub-menu classes*/
    type Classes = { display: string , opacity: string , translate: string }
    const [ classes , setClasses ] = useState <Classes> ( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-x-5' } )
    const [ toggle , setToggle ] = useState <boolean> ( false )

    type Fields = { title: string , content: string }
    const [ fields , setFields ] = useState <Fields> ( { title: obj.title , content: obj.content } )

    /* parse color */
    const background = colorParser.background( obj.color )
    const border = colorParser.border( obj.color )

    /* for DOM change states */
    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )

    /* toggle edit */
    const [ edit , setEdit ] = useState <boolean> ( true )

    /* title and content field ref */
    const refTitle = useRef <any> ( null )
    const refContent = useRef <any> ( null )

    const router = useRouter()

    return <>

    <div id={ obj.tid } className={ `${ background } ${ border } ${ obj.color === 'white' || obj.color === 'green' || obj.color === 'yellow' ? 'text-gray-950' : 'text-white' } border-2 text-sm h-52 w-full rounded` }>
        
        <div className='flex items-center justify-between p-3'>
            <input
                ref={ refTitle }
                type='text'
                onChange={ ( e: any ) => setFields( { ... fields , title: e.target.value.trim() } ) }
                className={ `bg-transparent font-open-sans-semibold truncate w-2/4 ${ edit ? 'border-transparent border' : 'border-gray-200 border px-1' } rounded cursor-auto outline-none` }
                id='title'
                defaultValue={ fields.title === '' ? 'no title' : fields.title }
                disabled={ edit || disabled }
            />
            <div className='relative flex items-center space-x-1'>
                <button
                    onClick={ async ( e: any ) => {

                        setToggle( !toggle )

                        toggle && edit
                            ?   (
                                    setClasses( { display: 'block' , opacity: 'opacity-0' , translate: 'translate-x-5' } ),
                                    setTimeout( () => setClasses( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-x-5' } ) , 300 )
                                )
                            :   (
                                    setClasses( { display: 'block' , opacity: 'opacity-0' , translate: 'translate-x-5' } ),
                                    setTimeout( () => setClasses( { display: 'block' , opacity: 'opacity-100' , translate: 'translate-x-0' } ) , 1 )
                                )
                    
                        if ( edit === false ) {

                            setDisabled( true )
                            setLoading( true )

                            const createEncryptedPayload = new CreateEncryptedPayload()
                            const generateSerial = new GenerateSerial()

                            const serial: string = String( generateSerial.keyCode() )
                            const encrypt: string = createEncryptedPayload.wrap( {
                                serial: serial,
                                command: 'edit',
                                tid: obj.tid,
                                ... fields
                            } )

                            await axios ( {
                                method: 'post',
                                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/templates`,
                                data: { payload: encrypt },
                                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                            } )
                            .then ( ( res: any ) => {

                                if ( res.status === 200 ) {

                                    const { title , content } = res.data

                                    setTimeout( () => {

                                        if ( title.pass && content.pass ) {

                                            setPass( true )
                                            setTimeout( () => router.reload() , 1000 )

                                        }

                                        else {

                                            setDisabled( false )
                                            setLoading( false )

                                            setPass( false )
                                            swal( {
                                                title: '',
                                                text: `${ title.msg } \n${ content.msg }`,
                                                icon: 'warning',
                                                dangerMode: true,
                                            } )

                                            setEdit( false )

                                            refTitle.current.value = fields.title === '' ? 'no title' : fields.title
                                            refContent.current.value = fields.content

                                        }

                                    } , 500 )

                                }

                                else {

                                    setTimeout( () => {

                                        setDisabled( false )
                                        setLoading( false )

                                        setPass( false )
                                        swal( {
                                            title: '',
                                            text: 'an error occured.',
                                            icon: 'warning',
                                            dangerMode: true,
                                        } )

                                        setEdit( false )

                                        refTitle.current.value = fields.title === '' ? 'no title' : fields.title
                                        refContent.current.value = fields.content

                                    } , 500 )

                                }

                            } )
                            .catch( ( err: any ) => {

                                if ( err ) {

                                    console.error( err.message )

                                    setTimeout( () => {

                                        setDisabled( false )
                                        setLoading( false )

                                        setPass( false )
                                        swal( {
                                            title: '',
                                            text: 'an error occured.',
                                            icon: 'warning',
                                            dangerMode: true,
                                        } )

                                        setEdit( false )

                                        refTitle.current.value = fields.title === '' ? 'no title' : fields.title
                                        refContent.current.value = fields.content

                                    } , 500 )

                                }

                            } )

                        }

                    } }
                    type='button'
                    className='cursor-pointer outline-none disabled:cursor-default'
                    disabled={ disabled }
                >
                    {
                        !toggle && edit && !loading
                                ?   <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
                                        <circle cy='12' cx='12' r='3' fill='currentColor' />
                                        <circle cy='4' cx='12' r='3' fill='currentColor' />
                                        <circle cy='20' cx='12' r='3' fill='currentColor' />
                                    </svg>
                        :   loading
                                ?   <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
                                        <circle cx='12' cy='12' r='3' fill='currentColor' />
                                        <g>
                                            <circle cx='4' cy='12' r='3' fill='currentColor' />
                                            <circle cx='20' cy='12' r='3' fill='currentColor' />
                                            <animateTransform attributeName='transform' calcMode='spline' dur='1s' keySplines='.36,.6,.31,1;.36,.6,.31,1' repeatCount='indefinite' type='rotate' values='0 12 12;180 12 12;360 12 12' />
                                        </g>
                                    </svg>
                                :   <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='1em'
                                        height='1em'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            fill='currentColor'
                                            d='M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h11.175q.4 0 .763.15t.637.425l2.85 2.85q.275.275.425.638t.15.762V19q0 .825-.588 1.413T19 21H5Zm7-3q1.25 0 2.125-.875T15 15q0-1.25-.875-2.125T12 12q-1.25 0-2.125.875T9 15q0 1.25.875 2.125T12 18Zm-5-8h7q.425 0 .713-.288T15 9V7q0-.425-.288-.713T14 6H7q-.425 0-.713.288T6 7v2q0 .425.288.713T7 10Z'
                                        />
                                    </svg>
                    }
                </button>

                <div className={ `absolute right-6 flex items-center space-x-2 transition ease-in-out duration-300 ${ classes.display } ${ classes.opacity } ${ classes.translate } ${ obj.color === 'white' ? 'bg-gray-200' : 'bg-white' } rounded p-1` }>
                    <button
                        onClick={ ( e: any ) => {

                            setEdit( false )
                            setTimeout( () => refTitle.current.select() , 1 )

                        } }
                        type='button'
                        className='text-gray-600 cursor-pointer outline-none disabled:cursor-default'
                        disabled={ disabled || template_edit ? false : true }
                    >
                        <PencilIcon className='h-4 w-4' />
                    </button>
                    <button
                        onClick={ ( e: any ) => {

                            swal ( {
                                title: 'delete this template?',
                                text: 'this action is irreversible.',
                                icon: 'warning',
                                dangerMode: true,
                            } )
                            .then ( async ( del ) => {

                                if ( del ) {

                                    setDisabled( true )
        
                                    const createEncryptedPayload = new CreateEncryptedPayload()
                                    const generateSerial = new GenerateSerial()
        
                                    const serial: string = String( generateSerial.keyCode() )
                                    const encrypt: string = createEncryptedPayload.wrap( {
                                        serial: serial,
                                        command: 'delete',
                                        tid: obj.tid
                                    } )
        
                                    await axios ( {
                                        method: 'post',
                                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/templates`,
                                        data: { payload: encrypt },
                                        headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                                    } )
                                    .then ( ( res: any ) => {

                                        swal( {
                                            title: 'template deleted.',
                                            text: '',
                                            icon: 'success'
                                        } )
                                        .then ( ok => {
                
                                            // after deleting reload the page without the query.
                                            router.push( `/dashboard/templates?token=${ query.token }` )
                                            setTimeout( () => router.reload() , 300 )
                
                                        } )

                                    } )
                                    .catch( ( err: any ) => {

                                        if ( err ) {
    
                                            console.error( err.message )
        
                                            setTimeout( () => {
        
                                                setDisabled( false )

                                                swal( {
                                                    title: '',
                                                    text: 'an error occured.',
                                                    icon: 'warning',
                                                    dangerMode: true,
                                                } )
        
                                            } , 500 )
        
                                        }
                
                                    } )

                                }

                            } )

                        } }
                        type='button'
                        className='text-gray-600 cursor-pointer outline-none disabled:cursor-default'
                        disabled={ disabled || template_del ? false : true }
                    >
                        <TrashIcon className='h-4 w-4' />
                    </button>
                </div>
            </div>
        </div>

        {
            edit
                ?   <p className='font-open-sans-light px-3 pb-3 overflow-auto h-36 no-scrollbar'>{ fields.content }</p>
                :   <div className='px-3 pb-3'>
                        <textarea
                            ref={ refContent }
                            onChange={ ( e: any ) => setFields( { ... fields , content: e.target.value.trim() } ) }
                            className={ `bg-transparent font-open-sans-light h-full w-full resize-none ${ edit ? 'border-transparent border' : 'border-gray-200 border px-1' } rounded cursor-auto outline-none` }
                            rows={ 6 }
                            id='content'
                            defaultValue={ fields.content }
                            disabled={ edit || disabled }
                        />
                    </div>
        }
        
    </div>
    
    </>

}
