import { useState } from 'react'

import Link from 'next/link'

import { signOut } from 'next-auth/react'

import OutsideClickHandler from 'react-outside-click-handler'

import { EnvelopeIcon , InboxStackIcon , PhoneIcon , DocumentTextIcon , ArrowUpRightIcon , QueueListIcon , XCircleIcon , ArrowLeftOnRectangleIcon , SunIcon , MoonIcon } from '@heroicons/react/20/solid'

interface Props {
    query: any
    page: string
    slide: boolean
    setSlide: Function
}

export default function MainNavbar ( props: Props ): JSX.Element {

    const { query , page , slide , setSlide } = props

    const [ toggle , setToggle ] = useState <boolean> ( false )

    return <>

    <div className={ `fixed z-50 h-full transition ease-in-out duration-300 ${ slide ? '-translate-x-0' : '-translate-x-72' } md:-translate-x-0` }>

        <OutsideClickHandler
            onOutsideClick={ ( e: any ) => setSlide( false ) }
        >
            <nav className={ `relative bg-white ${ slide ? 'shadow-black/30 drop-shadow-lg' : 'md:shadow-transparent md:drop-shadow-none' } border-r border-gray-100 h-screen w-72 p-5` }>

                <div className='flex flex-col items-center justify-between h-full'>
                    <div className='block w-full'>

                        <div className='flex flex-col space-y-1'>
                            <Link
                                href={ `/dashboard?token=${ query.token }` }
                                legacyBehavior
                            >
                                <a className={ `flex items-center space-x-2 ${ page === 'dashboard' ? 'bg-gray-100' : 'bg-transparent' } text-gray-800 cursor-pointer outline-none rounded-md p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200` }>
                                    <EnvelopeIcon className='h-5 w-5 text-blue-600' />
                                    <h5 className='font-open-sans-medium text-sm capitalize'>send message</h5>
                                </a>
                            </Link>
                            <Link
                                href={ `/dashboard/inbox?token=${ query.token }` }
                                legacyBehavior
                            >
                                <a className={ `flex items-center space-x-2 ${ page === 'inbox' ? 'bg-gray-100' : 'bg-transparent' } text-gray-800 cursor-pointer outline-none rounded-md p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200` }>
                                    <InboxStackIcon className='h-5 w-5 text-sky-600' />
                                    <h5 className='font-open-sans-medium text-sm capitalize'>inbox</h5>
                                </a>
                            </Link>
                            <Link
                                href={ `/dashboard/contacts?token=${ query.token }` }
                                legacyBehavior
                            >
                                <a className={ `flex items-center space-x-2 ${ page === 'contacts' ? 'bg-gray-100' : 'bg-transparent' } text-gray-800 cursor-pointer outline-none rounded-md p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200` }>
                                    <PhoneIcon className='h-5 w-5 text-sky-600' />
                                    <h5 className='font-open-sans-medium text-sm capitalize'>contacts</h5>
                                </a>
                            </Link>
                            <Link
                                href={ `/dashboard/templates?token=${ query.token }` }
                                legacyBehavior
                            >
                                <a className={ `flex items-center space-x-2 ${ page === 'templates' ? 'bg-gray-100' : 'bg-transparent' } text-gray-800 cursor-pointer outline-none rounded-md p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200` }>
                                    <DocumentTextIcon className='h-5 w-5 text-sky-600' />
                                    <h5 className='font-open-sans-medium text-sm capitalize'>templates</h5>
                                </a>
                            </Link>
                            <Link
                                href={ `/dashboard/sent?token=${ query.token }` }
                                legacyBehavior
                            >
                                <a className={ `flex items-center space-x-2 ${ page === 'sent' ? 'bg-gray-100' : 'bg-transparent' } text-gray-800 cursor-pointer outline-none rounded-md p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200` }>
                                    <ArrowUpRightIcon className='h-5 w-5 text-sky-600' />
                                    <h5 className='font-open-sans-medium text-sm capitalize'>sent</h5>
                                </a>
                            </Link>
                            <Link
                                href={ `/dashboard/queues?token=${ query.token }` }
                                legacyBehavior
                            >
                                <a className={ `flex items-center space-x-2 ${ page === 'queues' ? 'bg-gray-100' : 'bg-transparent' } text-gray-800 cursor-pointer outline-none rounded-md p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200` }>
                                    <QueueListIcon className='h-5 w-5 text-yellow-400' />
                                    <h5 className='font-open-sans-medium text-sm capitalize'>queues</h5>
                                </a>
                            </Link>
                            <Link
                                href={ `/dashboard/failed?token=${ query.token }` }
                                legacyBehavior
                            >
                                <a className={ `flex items-center space-x-2 ${ page === 'failed' ? 'bg-gray-100' : 'bg-transparent' } text-gray-800 cursor-pointer outline-none rounded-md p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200` }>
                                    <XCircleIcon className='h-5 w-5 text-red-600' />
                                    <h5 className='font-open-sans-medium text-sm capitalize'>failed</h5>
                                </a>
                            </Link>
                        </div>
                    
                    </div>
                    
                    <div className='block w-full'>

                        <button
                            onClick={ ( e: any ) => signOut( { callbackUrl: '/' } ) } 
                            type='button'
                            className='flex items-center space-x-2 text-gray-800 cursor-pointer outline-none rounded-md p-3 w-full transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200'
                            disabled={ false }
                        >
                            <ArrowLeftOnRectangleIcon className='h-5 w-5 text-gray-500' />
                            <h5 className='font-open-sans-medium text-sm capitalize'>logout</h5>
                        </button>

                        {/* <div className='flex items-center justify-between'>

                            <button
                                onClick={ ( e: any ) => signOut( { callbackUrl: '/' } ) } 
                                type='button'
                                className='flex items-center space-x-2 text-gray-800 cursor-pointer outline-none rounded-md p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200'
                                disabled={ false }
                            >
                                <ArrowLeftOnRectangleIcon className='h-5 w-5 text-gray-500' />
                                <h5 className='font-open-sans-semibold capitalize'>logout</h5>
                            </button>

                            <button
                                onClick={ ( e: any ) => setToggle( !toggle ) } 
                                type='button'
                                className='bg-gray-300 cursor-pointer outline-none rounded-lg w-max h-max p-3 transition ease-in-out duration-300 hover:bg-gray-200 focus:bg-gray-200'
                                disabled={ false }
                            >
                                {
                                    toggle
                                        ?   <MoonIcon className='h-5 w-5 text-gray-500' />
                                        :   <SunIcon className='h-5 w-5 text-gray-500' />
                                }
                                
                            </button>

                        </div> */}

                    </div>
                </div>

            </nav>
        </OutsideClickHandler>

    </div>

    </>

}