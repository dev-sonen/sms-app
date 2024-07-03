import { useRouter } from 'next/router'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import swal from 'sweetalert'

import { TrashIcon } from '@heroicons/react/20/solid'

interface Props {
    obj: any | { account: string , username: string , name: string , image: string }
    disabled: boolean
}

export default function UsersDelete ( props: Props ): JSX.Element {

    const { obj , disabled } = props
    
    const router = useRouter()

    return <>

    <button
        onClick={ ( e: any ) => {
            
            swal ( {
                title: 'delete this account?',
                text: 'this action is irreversible.',
                icon: 'warning',
                dangerMode: true,
            } )
            .then ( async ( del ) => {

                if ( del ) {

                    const createEncryptedPayload = new CreateEncryptedPayload()
                    const generateSerial = new GenerateSerial()

                    const serial: string = String( generateSerial.keyCode() )
                    const encrypt: string = createEncryptedPayload.wrap( {
                        serial: serial,
                        role: 'admin',
                        command: 'delete',
                        account: obj.account,
                    } )

                    await axios ( {
                        method: 'post',
                        url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/account-settings-privileges`,
                        data: { payload: encrypt },
                        headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
                    } )
                    .then ( ( res: any ) => {

                        swal( {
                            title: 'account deleted.',
                            text: '',
                            icon: 'success'
                        } )
                        .then ( ok => {

                            router.reload()

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
        type='button'
        disabled={ disabled }
        className='text-red-500 cursor-pointer outline-none transition ease-in-out duration-300 hover:text-red-600 disabled:opacity-75 disabled:cursor-default disabled:hover:text-red-500'
    >
        <TrashIcon className='relative -z-10 h-5 w-5' />
    </button>
    
    </>

}
