import { useState } from 'react'

import Image from 'next/image'

import { UserCircleIcon , Cog6ToothIcon } from '@heroicons/react/20/solid'
import UsersDelete from './users-delete'

interface Props {
    obj: any | { account: string , username: string , name: string , image: string }
    disabled: boolean
}

export default function UsersList ( props: Props ): JSX.Element {

    const { obj , disabled } = props

    const [ toggle , setToggle ] = useState <boolean> ( false )

    return <>
    
    <td scope='row' className='p-2 h-10 lg:w-36'>

        <div className='flex items-center justify-start space-x-2'>
            {
                obj.image === ''
                    ?   <UserCircleIcon className='h-6 w-6 text-gray-500' />
                        // image must have a parent of relative
                    :   <div className='relative flex items-center rounded-full h-6 w-6 overflow-hidden'>
                            <Image
                                /*
                                    you need to add remote patterns if you want to access
                                    files in a local ip host with specific port.

                                    see "next.config.js"
                                */
                                src={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/content/${ obj.account }/${ obj.image }` }
                                alt='image'
                                fill
                                style={ {
                                    objectFit: 'cover'
                                } }
                            />
                        </div>
            }
            <div className='block'>
                <div className='text-blue-600 font-open-sans-regular'>{ obj.username }</div>
                <div className='lg:hidden font-open-sans-light'>{ obj.account }</div>
            </div>
        </div>

    </td>
    <td scope='row' className='p-2 h-10 w-5 lg:w-auto'>
        
        <div className='hidden lg:flex items-center justify-start h-full'>
            <span className='font-open-sans-light'>{ obj.account }</span>
        </div>

    </td>
    <td scope='row' className='p-2 h-10 w-10 lg:w-20'>

        <div className='relative z-10 flex items-center justify-end space-x-2'>
            <button
                onClick={ ( e: any ) => {
                    toggle
                        ?   (
                                setToggle( !toggle ),
                                e.target.parentNode.parentNode.parentNode.nextSibling.style.display = 'none'
                            )
                        :   (
                                setToggle( !toggle ),
                                e.target.parentNode.parentNode.parentNode.nextSibling.style.display = ''
                            )
                } }
                type='button'
                className='text-blue-500 cursor-pointer outline-none transition ease-in-out duration-300 hover:text-blue-600 disabled:opacity-75 disabled:cursor-default disabled:hover:text-blue-500'
                disabled={ disabled }
            >
                <Cog6ToothIcon className='relative -z-10 h-5 w-5' />
            </button>
            <UsersDelete
                obj={ obj }
                disabled={ disabled }
            />
        </div>

    </td>

    </>

}
