import TitleNavbar from '../title-navbar'
import ContactsNavigation from './contacts-navigation'

import TableContacts from './table-contacts'
import TableGroups from './table-groups'

interface Props {
    query: any
    user: any
    settings: any
    priviledges: any
    page: string
    tab: string
    slide: boolean
    setSlide: Function
}

export default function ContactsMain ( props: Props ): JSX.Element {

    const {
        query,
        user,
        settings,
        priviledges,
        page,
        tab,
        slide,
        setSlide
    } = props

    return <>

    <div className='mx-0 lg:mx-7 xl:mx-32'>

        <TitleNavbar
            query={ query }
            user={ user }
            page={ page }
            slide={ slide }
            setSlide={ setSlide }
        />

        <ContactsNavigation
            user={ user }
            query={ query }
            tab={ tab }
        />

        {
                tab === 'contacts'
                    ?   <TableContacts
                            query={ query }
                            priviledges={ priviledges }
                            settings={ settings }
                        />
            :   tab === 'groups'
                    ?   <TableGroups
                            query={ query }
                            priviledges={ priviledges }
                        />
            :   <></>
        }

    </div>

    </>

}
