import { useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import colorParser from '@/helpers/parse-color'

import { PlusIcon , XMarkIcon , CheckCircleIcon } from '@heroicons/react/20/solid'

interface Props {
    template_create: boolean
}

export default function ActionTemplatesAdd ( props: Props ): JSX.Element {

    const { template_create } = props

    type Classes = { display: string , opacity: string , translate: string }
    const [ classes , setClasses ] = useState <Classes> ( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-y-10' } )

    type Fields = { title: string , content: string , color: string }
    const [ fields , setFields ] = useState <Fields> ( { title: '' , content: '' , color: 'white' } )

    type Warning = { title: string , content: string }
    const [ warning , setWarning ] = useState <Warning> ( { title: '' , content: '' } )

    const [ disabled , setDisabled ] = useState <boolean> ( false )
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ pass , setPass ] = useState <boolean> ( false )

    const router = useRouter()

    /* parse color */
    const background = colorParser.background( fields.color )
    const border = colorParser.border( fields.color )

    return <>

    <div className='relative'>

        <button
            onClick={ ( e: any ) => {
                setClasses( { ... classes , display: 'flex' } )
                setTimeout( () => setClasses( { display: 'flex' , opacity: 'opacity-100' , translate: 'translate-y-0' } ) , 300 )
            } }
            type='button'
            className='bg-green-100 text-green-500 cursor-pointer outline-none p-1 rounded-full transition ease-in-out duration-300 hover:bg-green-500 hover:text-white disabled:cursor-default disabled:opacity-75 disabled:bg-gray-200 disabled:text-gray-500'
            disabled={ template_create ? false : true }
        >
            <PlusIcon className='h-6 w-6' />
        </button>

        <div
            onClick={ ( e: any ) => {
                e.target.id === 'window' && setClasses( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-y-10' } )
            } }
            id='window' //
            className={ `fixed z-50 left-0 top-0 right-0 bottom-0 items-center justify-center h-full bg-black/25 ${ classes.display }` }
        >
            <div className={ `flex justify-center p-3 w-full transition ease-in-out duration-300 ${ classes.opacity } ${ classes.translate }` }>
                
                <div className='grid gap-5 bg-white rounded-md w-full sm:w-[360px] p-5 transition-all ease-in-out duration-300'>
                    
                    <div className='flex items-center justify-between w-full'>
                        <h1 className='text-blue-600 text-lg font-open-sans-semibold capitalize'>message template</h1>
                        <button
                            onClick={ ( e: any ) => {
                                setClasses( { display: 'hidden' , opacity: 'opacity-0' , translate: 'translate-y-10' } )
                            } }
                            type='button'
                            className='bg-red-600 border-transparent text-white border cursor-pointer outline-none rounded-full p-0.5 transition ease-in-out duration-300 hover:border-red-300'
                        >
                            <XMarkIcon className='h-3 w-3' />
                        </button>
                    </div>

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
                                command: 'add',
                                ... fields
                            } )

                            await axios ( {
                                method: 'post',
                                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/templates`,
                                data: { payload: encrypt },
                                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                            } )
                            .then( ( res: any ) => {

                                if ( res.status === 200 ) {

                                    const { title , content } = res.data

                                    setTimeout( () => {

                                        if ( title.pass && content.pass ) {

                                            setLoading( false )

                                            setPass( true )
                                            setTimeout( () => router.reload() , 1000 )

                                        }

                                        else {

                                            setDisabled( false )
                                            setLoading( false )

                                            setPass( false )
                                            setWarning( { title: title.msg , content: content.msg } )

                                        }

                                    } , 500 )

                                }

                                else {

                                    setTimeout( () => {

                                        setDisabled( false )
                                        setLoading( false )

                                        setPass( false )
                                        setWarning( { title: 'an error occured.' , content: 'an error occured.' } )

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
                                        setWarning( { title: 'an error occured.' , content: 'an error occured.' } )

                                    } , 500 )

                                }

                            } )

                        } } 
                        typeof='submit'
                        className='grid gap-3'
                    >
                        
                        <div className={ `${ background } ${ border } ${ fields.color === 'white' || fields.color === 'green' || fields.color === 'yellow' ? 'text-gray-950' : 'text-white' } grid gap-3 border-2 p-3 rounded transition ease-in-out duration-300` }>
                            <div className='grid'>
                                <label htmlFor='title' className={ `${ fields.color === 'white' || fields.color === 'green' || fields.color === 'yellow' ? 'text-gray-950' : 'text-white' } text-xs uppercase font-open-sans-regular` }>title:</label>
                                <input
                                    type='text'
                                    onChange={ ( e: any ) => {
                                        setFields( { ... fields , title: e.target.value.trim() } )
                                        setWarning( { ... warning , title: '' } )
                                    } }
                                    className='bg-transparent text-xs border-b p-2 font-open-sans-regular cursor-auto outline-none w-full'
                                    id='title'
                                    disabled={ disabled || template_create ? false : true }
                                />
                            </div>
                            <div className='grid'>
                                <div className='flex items-center justify-between'>
                                    <label htmlFor='content' className={ `${ fields.color === 'white' || fields.color === 'green' || fields.color === 'yellow' ? 'text-gray-950' : 'text-white' } text-xs uppercase font-open-sans-regular` }>content:</label>
                                    <label className={ `bg-white ${ fields.content.length > 300 ? 'text-red-600' : 'text-gray-950' } p-0.5 rounded-sm transition ease-in-out duration-300 text-xs font-open-sans-light italic` }>{ fields.content.length }/300</label>
                                </div>
                                <textarea
                                    onChange={ ( e: any ) => {
                                        setFields( { ... fields , content: e.target.value.trim() } )
                                        setWarning( { ... warning , content: '' } )
                                    } }
                                    className='bg-transparent text-xs border-b p-2 font-open-sans-regular cursor-auto outline-none resize-none w-full'
                                    rows={ 6 }
                                    id='content'
                                    disabled={ disabled || template_create ? false : true }
                                />
                            </div>
                        </div>
                        
                        <div className='block'>
                            <div className='font-open-sans-regular text-red-500 text-xs'>{ `${ warning.title === '' ? '' : `* ${ warning.title }` }` }</div>
                            <div className='font-open-sans-regular text-red-500 text-xs'>{ `${ warning.content === '' ? '' : `* ${ warning.content }` }` }</div>
                        </div>

                        <div className='flex flex-col space-y-3'>
                            <label className='text-gray-950 text-xs font-open-sans-medium uppercase'>template color &#40;optional&#41;</label>
                            <div className='flex items-end space-x-1'>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'white' } ) } className='bg-white border border-gray-400 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-gray-500'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'green' } ) } className='bg-green-500 border border-green-500 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-green-300'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'blue' } ) } className='bg-blue-600 border border-blue-600 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-blue-300'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'yellow' } ) } className='bg-yellow-400 border border-yellow-400 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-yellow-200'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'red' } ) } className='bg-red-600 border border-red-600 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-red-400'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'sky' } ) } className='bg-sky-500 border border-sky-500 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-sky-400'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'amber' } ) } className='bg-amber-500 border border-amber-500 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-amber-300'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'teal' } ) } className='bg-teal-600 border border-teal-600 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-teal-400'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'purple' } ) } className='bg-purple-600 border border-purple-600 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-purple-400'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'pink' } ) } className='bg-pink-400 border border-pink-400 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-pink-200'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'rose' } ) } className='bg-rose-600 border border-rose-600 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-rose-400'></button>
                                <button type='button' onClick={ ( e: any ) => setFields( { ... fields , color: 'gray' } ) } className='bg-gray-800 border border-gray-800 cursor-pointer outline-none h-4 w-4 rounded-sm transition ease-in-out duration-300 focus:border-gray-500'></button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            className={ `${ pass ? 'bg-green-600 border-green-600 font-open-sans-medium hover:border-green-400 focus:border-green-600 disabled:hover:border-green-600 disabled:focus:border-green-600' : 'bg-blue-600 border-blue-600 font-open-sans-medium hover:border-blue-400 focus:border-blue-600 disabled:hover:border-blue-600 disabled:focus:border-blue-600' } flex items-center justify-center text-white border-2 text-sm uppercase cursor-pointer outline-none p-1 w-full rounded transition-all ease-in-out duration-300 disabled:cursor-default disabled:opacity-75` }
                            disabled={ disabled || template_create ? false : true }
                        >
                            {
                                loading
                                    ?   <span>...</span>
                                    :   pass
                                            ?   <CheckCircleIcon className='h-5 w-5' />
                                            :   'create'
                            }
                        </button>
                    </form>

                </div>

            </div>
        </div>

    </div>
    

    </>

}
