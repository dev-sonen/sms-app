import Link from 'next/link'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopyright } from '@fortawesome/free-solid-svg-icons'

interface Props {}

export default function Footer ( props: Props ): JSX.Element {

    return <>

    <footer className='absolute bottom-0 w-full p-5 sm:p-10'>

        <div className='flex flex-col space-y-3 items-center justify-between'>
            
            <div className='flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-black/30 rounded-sm p-5'>
                <div className='flex items-center space-x-1'>
                    <FontAwesomeIcon className='text-white h-4 w-4' icon={ faCopyright } />
                    <span className='text-white font-open-sans-light text-xs'>2023 All rights reserved.</span>
                </div>
                <Link href={ '/' } className='text-white font-open-sans-bold text-xs'>
                    SMS Response App
                </Link>
            </div>
    
        </div>

    </footer>

    </>

}
