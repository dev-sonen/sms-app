import TitleNavbar from '../title-navbar'
import TableQueues from './table-queues'

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

export default function QueuesMain ( props: Props ): JSX.Element {

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

        <TableQueues
            query={ query }
            priviledges={ priviledges }
        />

    </div>

    </>

}
