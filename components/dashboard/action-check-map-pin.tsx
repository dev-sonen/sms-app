import { useState } from 'react'

import OutsideClickHandler from 'react-outside-click-handler'

import { ChatBubbleBottomCenterIcon , MapPinIcon } from '@heroicons/react/20/solid'

interface Props {
    obj: any
    setWarning: Function
    setClasses: Function
    setGroupObj: Function
    disabled: boolean
}

export default function ActionCheckMapPin ( props: Props ): JSX.Element {

    const { obj , setWarning , setClasses , setGroupObj , disabled } = props

    const [ select , setSelect ] = useState <boolean> ( false )

    return <>

    <OutsideClickHandler onOutsideClick={ ( e: any ) => {

        /*
            these will not change the icon even if you
            performed outside click unless the "event"
            click "id" is not equal to ""
        */
        e.target.id !== '' && e.target.id !== 'search' && e.target.id !== 'window' && setSelect( false )

    } }>
        <div className='relative z-10'>
            <button
                onClick={ ( e: any ) => {
                    /* open window */
                    setClasses( { display: 'block' , opacity: 'opacity-0' , translate: '-translate-x-20' } )
                    setTimeout( () => setClasses( { display: 'block' , opacity: 'opacity-100' , translate: '-translate-x-0' } ) , 300 )

                    /* set the obj */
                    setGroupObj( obj )

                    /* change icon when click */
                    setSelect( true )

                    /* clear warning */
                    setWarning( { message: '' } )
                } }
                type='button'
                id={ obj.gid }
                className={ `cursor-pointer outline-none transition ease-in-out duration-300 hover:scale-110` }
                disabled={ disabled }
            >
                {
                    select
                        ?   <ChatBubbleBottomCenterIcon className='relative text-blue-600 -z-10 h-6 w-6' />
                        :   <MapPinIcon className='relative text-red-600 -z-10 h-6 w-6' />
                }
            </button>
        </div>
    </OutsideClickHandler>
 
    </>

}
