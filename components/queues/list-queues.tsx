import { useState } from 'react'

import { BarsArrowDownIcon , BarsArrowUpIcon } from '@heroicons/react/20/solid'

interface Props {
    disabled: boolean
    obj: any
    one: any                // for checkbox.
    all: any                // for checkbox.
    queue_del: boolean      // for priveledges.
    setMenu: Function       // enable and disabled "menu" state.
}

export default function ListQueues ( props: Props ): JSX.Element {

    const {
        disabled,
        obj,
        one,
        all,
        queue_del,
        setMenu
    } = props

    const [ toggle , setToggle ] = useState <boolean> ( false )

    return <>

    <tr
        id='list'
        className='border-gray-100 border-b'
    >
        <td scope='row' className='p-2 h-10 w-10'>

            <div className='flex items-center justify-center h-full w-full'>
                <input
                    onChange={ ( e: any ) => {

                        // array container.
                        let cont: number[] = []
                        
                        all.current.childNodes.forEach( ( elem: any ) => {            
                            // this target the "tr" element with the "list" id                
                            elem.id === 'list'
                                ?   elem.firstChild.firstChild.firstChild.checked
                                        ?   cont.push( 1 )  // append "1" to the array "cont" if true.
                                        :   cont.push( 0 )  // append "0" to the array "cont" if false.
                                :   null
                        } )

                        /*
                            if all the computed value is equal to the length of the "childNodes" divided by "2"
                            since each loop contains additional "+1" element, this doubles the "siblings" for each loop
                            so you need to divide it by "2" because one "sibling" does not contain a "checkbox". 
                        */
                        cont.reduce( ( a: number , b: number ) => a + b , 0 ) === all.current.childNodes.length / 2
                            ?   one.current.checked = true      // "check" the "checkbox" with ref "one"
                            :   one.current.checked = false     // "un-check" the "checkbox" with ref "one"

                        // if all the "checkbox" are false
                        cont.reduce( ( a: number , b: number ) => a + b , 0 ) === 0
                            ?   setMenu( true )     // disable the "menu" state.
                            :   setMenu( false )    // enable the "menu" state.

                    } }
                    type='checkbox'
                    id={ obj.file }
                    className='cursor-pointer outline-none disabled:opacity-75'
                    disabled={ disabled || queue_del ? false : true }
                />
            </div>

        </td>
        <td scope='row' className='p-2 h-10 w-32'>
            <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-light'>
                { obj.to }
            </div>
        </td>
        <td scope='row' className='p-2 h-10 w-max'>
            <div className='flex items-center justify-start h-full text-gray-800 font-open-sans-light w-28 sm:w-44 md:w-64 lg:w-96 truncate'>
                { obj.message }
            </div>
        </td>
        <td scope='row' className='p-2 h-10 w-10'>

            <div className='relative z-10 flex items-center justify-center'>
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
                    className='text-blue-500 text-xs font-open-sans-regular cursor-pointer outline-none rounded-full p-1 transition ease-in-out duration-300 hover:text-blue-600 disabled:opacity-75 disabled:cursor-default hover:bg-blue-500/20 disabled:hover:text-blue-500'
                    disabled={ disabled }
                >
                    {
                        !toggle
                            ?   <BarsArrowDownIcon className='relative -z-10 h-4 w-4' />
                            :   <BarsArrowUpIcon className='relative -z-10 h-4 w-4' />
                    }
                </button>
            </div>

        </td>
    </tr>

    <tr
        id='details'
        className='border-gray-100 border-b transition-all ease-in-out duration-300'
        style={ { display: 'none' } }
    >
        <td scope='row' colSpan={ 7 } className='bg-gray-50 p-3 sm:p-7'>

            <div className='grid gap-5'>

                <div className='grid gap-1'>
                    <h5 className='text-blue-600 font-open-sans-semibold capitalize'>to:</h5> 
                    <span className='font-open-sans-light'>{ obj.to }</span>
                </div>
                <div className='grid gap-1'>
                    <h5 className='text-blue-600 font-open-sans-semibold capitalize'>message:</h5>
                    <p className='font-open-sans-light'>{ obj.message }</p>
                </div>
                    
            </div>
        
        </td>
    </tr>

    </>

}
