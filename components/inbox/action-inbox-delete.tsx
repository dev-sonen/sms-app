import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import swal from 'sweetalert'

import { TrashIcon } from '@heroicons/react/20/solid'

interface Props {
    query: any
    all: any
    menu: boolean
    inbox_del: boolean
    disabled: boolean
}

export default function ActionInboxDelete ( props: Props ): JSX.Element {

    const { query , all , menu , inbox_del , disabled } = props

    const router = useRouter()

    return <>

    <form
        onSubmit={ ( e: any ) => {

            e.preventDefault()

            // array container.
            let filename: number[] = []

            all.current.childNodes.forEach( ( elem: any ) => {
                // this target the "tr" element with the "list" id
                elem.id === 'list'
                    // if the current "checkbox" is "true"
                    &&  elem.firstChild.firstChild.firstChild.checked
                            // append the "id" of that checkbox
                            &&  filename.push( elem.firstChild.firstChild.firstChild.id )
            } )

            swal ( {
                title: 'delete this message?',
                text: `[${ filename.length }] item(s) selected.`,
                icon: 'warning',
                dangerMode: true,
            } )
            .then( async ( del ) => {

                if ( del ) {

                    const createEncryptedPayload = new CreateEncryptedPayload()
                    const generateSerial = new GenerateSerial()

                    const serial: string = String( generateSerial.keyCode() )
                    const encrypt: string = createEncryptedPayload.wrap( {
                        serial: serial,
                        command: 'delete',
                        filename: filename,
                    } )

                    await axios ( {
                        method: 'post',
                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/inbox`,
                        data: { payload: encrypt },
                        headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                    } )
                    .then ( ( res: any ) => {

                        swal( {
                            title: 'deleted.',
                            text: '',
                            icon: 'success'
                        } )
                        .then ( ok => {

                            // after deleting reload the page without the query.
                            router.push( `/dashboard/inbox?token=${ query.token }` )
                            setTimeout( () => router.reload() , 300 )

                        } )
                    
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
        className='block'
    >
        <button
            type='submit'
            className='text-gray-700 cursor-pointer outline-none p-1 rounded transition ease-in-out duration-300 hover:bg-gray-200 hover:text-red-500 disabled:opacity-75 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-gray-700'
            disabled={ menu || disabled || !inbox_del }
        >
            <TrashIcon className='h-4 w-4' />
        </button>
    </form>
    
    </>

}
