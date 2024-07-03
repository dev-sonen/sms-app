import TitleNavbar from '../title-navbar'
import AccountNavigation from './account-navigation'

import Credentials from './credentials'
import Privileges from './privileges'
import Config from './config'

interface Props {
    query: any
    user: any
    settings: any
    page: string
    tab: string
    slide: boolean
    setSlide: Function
}

export default function AccountSettingsMain ( props: Props ): JSX.Element {

    const {
        query,
        user,
        settings,
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

        <AccountNavigation
            user={ user }
            query={ query }
            tab={ tab }
        />

        {
                tab === 'credentials'
                    ?   <Credentials
                            user={ user }
                            settings={ settings }
                        />
            :   tab === 'users-and-privileges'
                    ?   <Privileges
                            user={ user }
                        />
            :   tab === 'configurations'
                    ?   <Config
                            user={ user }
                            settings={ settings }
                        />
            :   <></>
        }

    </div>

    </>

}
