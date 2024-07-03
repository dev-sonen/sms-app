import Link from 'next/link'

interface Props {
    user: any
    query: any
    tab: string
}

export default function ContactsNavigation ( props: Props ): JSX.Element {

    const { user , query , tab } = props

    return <>
    
    <nav className='px-5 md:px-10 transition-all ease-in-out duration-300'>

        <div className='grid grid-cols-3 w-full sm:w-96'>

            <Link
                href={ `/dashboard/contacts?token=${ query.token }` }
                className={ `flex justify-center ${ tab === 'contacts' ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white' : 'bg-gray-100 border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-300 hover:text-gray-800' } border-l border-y font-open-sans-regular text-xs uppercase cursor-pointer outline-none px-3 py-1 rounded-l transition-all ease-in-out duration-300` }
            >
                contacts
            </Link>

            <Link
                href={ `/dashboard/contacts/groups?token=${ query.token }` }
                className={ `flex justify-center ${ tab === 'groups' ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white' : 'bg-gray-100 border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-300 hover:text-gray-800' } border-x border-y font-open-sans-regular text-xs uppercase cursor-pointer outline-none px-3 py-1 rounded-r transition-all ease-in-out duration-300` }
            >
                groups
            </Link>

        </div>

    </nav>
    
    </>

}
