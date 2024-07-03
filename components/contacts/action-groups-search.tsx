import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

interface Props {
    setSearch: Function
    disabled: boolean
}

export default function ActionGroupSearch ( props: Props ): JSX.Element {

    const { setSearch , disabled } = props

    return <>

    <form
        onSubmit={ ( e: any ) => {
            e.preventDefault()
            setSearch( e.target.users_search.value )
        } }
        typeof='submit'
        className='block'
    >
        <div className='flex justify-end'>
            <div className='relative flex items-center w-full sm:w-96'>
                <input
                    type='text'
                    className='bg-gray-100 border-gray-100 font-open-sans-regular text-gray-950 text-xs border-2 cursor-auto outline-none rounded py-1 pl-2 pr-10 w-full transition-all ease-in-out duration-300 hover:border-gray-500 focus:border-gray-400 disabled:cursor-default disabled:opacity-75 disabled:hover:border-gray-300 disabled:focus:border-gray-300'
                    id='users_search'
                    placeholder={ 'search' }
                    disabled={ disabled }
                />
                <button
                    type='submit'
                    className='absolute right-2 text-gray-500 cursor-pointer outline-none disabled:cursor-default'
                    disabled={ disabled }
                >
                    <MagnifyingGlassIcon className='h-5 w-5' />
                </button>
            </div>
        </div>
    </form>

    </>

}
