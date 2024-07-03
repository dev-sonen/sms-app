import { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'

import OutsideClickHandler from 'react-outside-click-handler'

import { UserCircleIcon , Bars3Icon } from '@heroicons/react/20/solid'

interface Props { 
    query: any
    page: string
    user: any
    slide: boolean
    setSlide: Function
}

export default function TitleNavbar ( props: Props ): JSX.Element {

    const { query , page , user , slide , setSlide } = props

    const [ toggle , setToggle ] = useState <boolean> ( false )

    return <>

    <nav className='relative p-5 md:p-10 transition-all ease-in-out duration-300'>
        
        <div className='flex items-center justify-between'>

            <div className='flex items-center space-x-2 md:space-x-0'>
                <button
                    type='button'
                    onClick={ ( e: any ) => setSlide( !slide ) }
                    className='block md:hidden bg-blue-600 border-blue-600 text-white border-2 cursor-pointer outline-none p-1 rounded transition ease-in-out duration-300 hover:bg-blue-500 hover:border-blue-400 focus:border-blue-400'
                >
                    <Bars3Icon className='h-5 w-5' />
                </button>
                <h1 className='text-blue-600 text-lg font-open-sans-semibold capitalize'>{ page }</h1>
            </div>
            
            <button
                type='button'
                onClick={ ( e: any ) => setToggle( true ) }
                className='flex items-center space-x-1 text-gray-950 text-sm font-thin cursor-pointer outline-none p-2 rounded transition ease-in-out duration-300 hover:bg-gray-300 focus:bg-gray-300'
            >
                {
                    user.image === ''
                        ?   <UserCircleIcon className='h-7 w-7 text-gray-500' />
                            // image must have a parent of relative
                        :   <div className='relative flex items-center rounded-full h-7 w-7 overflow-hidden'>
                                <Image
                                    src={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/content/${ user.account }/${ user.image }` }
                                    alt='image'
                                    fill
                                    style={ {
                                        objectFit: 'cover'
                                    } }
                                />
                            </div>
                }
                <div className='hidden sm:flex'>
                    <span className='hidden lg:block mr-1 font-open-sans-light'>welcome back,</span>
                    <span className='font-open-sans-semibold text-blue-600'>{ user.name }</span>
                </div>
            </button>

        </div>
        
        <OutsideClickHandler
            onOutsideClick={ ( e: any ) => setToggle( false ) }
        >
            <div className={ `${ toggle ? 'block' : 'hidden' } absolute z-50 right-5 -bottom-44 bg-gray-100 shadow-black/30 drop-shadow rounded-lg w-[300px] p-5 transition-all ease-in-out duration-300` }>
                <div className='flex flex-col space-y-5 w-full'>
                    <div className='flex items-center space-x-2'>
                        {
                            user.image === ''
                                ?   <UserCircleIcon className='h-14 w-14 text-gray-500' />
                                    // image must have a parent of relative
                                :   <div className='relative flex items-center rounded-full h-14 w-14 overflow-hidden'>
                                        <Image
                                            src={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/content/${ user.account }/${ user.image }` }
                                            alt='image'
                                            fill
                                            style={ {
                                                objectFit: 'cover'
                                            } }
                                        />
                                    </div>
                        }
                        <div className='block'>
                            <h1 className='text-blue-600 text-lg font-open-sans-semibold'>{ user.username }</h1>
                            <h5 className='text-gray-950 text-xs font-open-sans-light'>{ user.role }</h5>
                        </div>
                    </div>

                    <Link
                        href={ `/dashboard/account-settings?token=${ query.token }` }
                        className='bg-blue-600 border-blue-600 text-white font-open-sans-regular text-center text-sm uppercase border-2 cursor-pointer outline-none rounded-lg p-2 w-full transition ease-in-out duration-300 hover:border-blue-300 focus:border-blue-300'
                    >
                        account settings
                    </Link>
                </div>
            </div>
        </OutsideClickHandler>

    </nav>

    </>

}