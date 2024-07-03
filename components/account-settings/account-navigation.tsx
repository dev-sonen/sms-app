import Link from 'next/link'

interface Props {
    user: any
    query: any
    tab: string
}

export default function AccountNavigation ( props: Props ): JSX.Element {

    const { user , query , tab } = props

    if ( user.role === 'admin' ) {

        return <>

        <nav className='px-5 md:px-10 transition-all ease-in-out duration-300'>

            <div className='grid grid-cols-3 w-full lg:w-96'>

                <Link
                    href={ `/dashboard/account-settings?token=${ query.token }` }
                    className={ `flex justify-center ${ tab === 'credentials' ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white' : 'bg-gray-100 border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-300 hover:text-gray-800' } border-l border-y font-open-sans-regular text-xs uppercase cursor-pointer outline-none px-3 py-1 rounded-l transition-all ease-in-out duration-300` }
                >
                    credentials
                </Link>

                <Link
                    href={ `/dashboard/account-settings/users-and-privileges?token=${ query.token }` }
                    className={ `flex justify-center ${ tab === 'users-and-privileges' ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white' : 'bg-gray-100 border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-300 hover:text-gray-800' } border-x border-y font-open-sans-regular text-xs uppercase cursor-pointer outline-none px-3 py-1 rounded-none transition-all ease-in-out duration-300` }
                >
                    privileges
                </Link>

                <Link
                    href={ `/dashboard/account-settings/configurations?token=${ query.token }` }
                    className={ `flex justify-center ${ tab === 'configurations' ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white' : 'bg-gray-100 border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-300 hover:text-gray-800' } border-r border-y font-open-sans-regular text-xs uppercase cursor-pointer outline-none px-3 py-1 rounded-r transition-all ease-in-out duration-300` }
                >
                    config
                </Link>

            </div>

        </nav>
        
        </>

    }

    return <></>

}
