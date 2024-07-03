import TitleNavbar from '../title-navbar'
import IndexNavigation from './index-navigation'

import GuiCompose from './gui-compose'
import GuiCheckMap from './gui-check-map'

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

export default function IndexMain ( props: Props ): JSX.Element {

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

        <IndexNavigation
            user={ user }
            query={ query }
            tab={ tab }
        />

        {
                tab === 'compose'
                    ?   <GuiCompose
                            user={ user }
                            query={ query }
                            priviledges={ priviledges }
                        />
            :   tab === 'check-map'
                    ?   <GuiCheckMap
                            user={ user }
                            query={ query }
                            priviledges={ priviledges }
                        />
            :   <></>
        }

    </div>

    </>

}
