import { useState } from 'react'

import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import { useSession } from 'next-auth/react'

import { db } from '@/config/sqlite.config'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'

import MainNavbar from '@/components/main-navbar'
import IndexMain from '@/components/dashboard/index-main'
import { Loader } from '@/components/icons'

interface Props {
    query: string
    page: string
    tab: any
    user: any
    settings: any
    priviledges: any
}

export default function Page ( props: Props ): JSX.Element {

    const {
        query,
        page,
        tab,
        user,
        settings,
        priviledges
    } = props

    const { data: session , status }: any = useSession()
    const userFromSession: any = session?.account
    const userFromToken: any = user?.account

    const [ slide , setSlide ] = useState <boolean> ( false )

    switch ( status ) {

        case 'loading':

            return  <>

            <Head>
                <title>this may take a few seconds...</title>
                <meta name='description' content='' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <link rel='icon' href='/app-icon.png' />
            </Head>

            <main className='relative h-screen w-screen'>

                <div className='relative z-10 flex items-center justify-center h-full'>
                    <Loader className='h-7 w-7 text-blue-500' />
                </div>

            </main>

            </>
        
        case 'authenticated':

            if ( userFromSession && userFromToken && userFromSession === userFromToken ) {

                return <>

                <Head>
                    <title>dashboard</title>
                    <meta name='description' content='' />
                    <meta name='viewport' content='width=device-width, initial-scale=1' />
                    <link rel='icon' href='/app-icon.png' />
                </Head>

                <main className='h-screen w-screen'>
                    
                    <div className='flex w-full h-full'>
                        <MainNavbar
                            query={ query }
                            page={ page }
                            slide={ slide }
                            setSlide={ setSlide }
                        />
                        <div className='pl-0 md:pl-72 w-full h-full transition-all ease-in-out duration-300'>
                            <IndexMain
                                query={ query }
                                user={ user }
                                settings={ settings }
                                priviledges={ priviledges }
                                page={ page }
                                tab={ tab }
                                slide={ slide }
                                setSlide={ setSlide }
                            />
                        </div>
                    </div>

                </main>

                </>

            }

            return <>

            <Head>
                <title>page not found</title>
                <meta name='description' content='the page you were looking for does not exist.' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <link rel='icon' href='/app-icon.png' />
            </Head>

            <main className='flex flex-col space-y-3 bg-white h-screen w-screen p-5'>
                <h1 className='text-gray-950 font-open-sans-regular capitalize'>{ userFromSession && userFromToken && userFromSession !== userFromToken ? 'your session is expired.' : '404 page not found.' }</h1>
                {
                    userFromSession && userFromToken && userFromSession !== userFromToken
                        ?   <Link href='/' className='bg-blue-600 border-blue-600 text-white text-xs border-2 font-open-sans-semibold uppercase cursor-pointer outline-none rounded-sm py-1 px-2 w-max transition ease-in-out duration-300 hover:border-blue-400 focus:border-blue-400'>reload page</Link>
                        :   <></>
                }
            </main>

            </>

    }

    return <>
    
    <Head>
        <title>sms app</title>
        <meta name='description' content='' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/app-icon.png' />
    </Head>

    <main className='relative h-screen w-screen'>

        <div className='absolute h-full w-full'>
            <Image
                src={ `${ process.env.NEXT_PUBLIC_MEDIA_SERVER }/system/${ settings.system_image }` }
                alt='image'
                className='object-cover'
                fill
            />
        </div>

        <div className='relative z-10 flex items-center justify-center h-full p-5'>
            
            <div className='flex flex-col items-center space-y-3 bg-black/30 p-10 rounded-3xl'>
                <h1 className='text-white font-open-sans-semibold text-xl text-center uppercase'>you&apos;re currently logout</h1>
                <Link href={ '/' } className='border-blue-600 bg-blue-600 border-2 text-white font-open-sans-semibold text-sm uppercase cursor-pointer outline-none rounded-lg py-2 px-5 transition ease-in-out duration-300 hover:border-blue-400 focus:border-blue-400'>sign me in</Link>
            </div>

        </div>

    </main>

    </>

}

export const getServerSideProps: GetServerSideProps = async ( context ) => {

    const token: string | any = context.query.token

    const user = async ( token: string ) => {

        if ( token === undefined ) {
            return null
        }

        try {

            const account: string = new CreateEncryptedPayload().parse( token )
            const find_user: any = await db.prepare( `SELECT * FROM users WHERE account = ?` ).get( account )
            
            if ( find_user === undefined ) {
                return null
            }

            return {
                account: find_user.account,
                username: find_user.username,
                role: find_user.role,
                name: find_user.name,
                image: find_user.image
            }

        } catch ( err ) {

            if ( err ) {
                return null
            }

        }

    }

    const settings = async () => {

        try {

            const settings: any = await db.prepare( `SELECT * FROM system_settings WHERE id = ?` ).get( 1 )

            if ( settings === undefined ) {
                return null
            }
            
            return {
                system_image: settings.system_image,
                contact_limit: settings.contact_limit,
                signup_feature: settings.signup_feature === 1 ? true : false,
                user_upload: settings.user_upload === 1 ? true : false,
                contacts_upload: settings.contacts_upload === 1 ? true : false
            }

        } catch ( err ) {

            if ( err ) {
                return null
            }

        }

    }

    const priviledges = async ( token: string ) => {

        if ( token === undefined ) {
            return null
        }

        try {

            const account: string = new CreateEncryptedPayload().parse( token )
            
            const priviledges: any = await db.prepare( `
                SELECT
                    users.account,
                    users.username,
                    users.role,
                    priveledges_send.send_nmsg,
                    priveledges_send.send_fmsg,
                    priveledges_send.send_gmsg,
                    priveledges_inbox.inbox_read,
                    priveledges_inbox.inbox_del,
                    priveledges_contacts.contacts_add,
                    priveledges_contacts.contacts_edit,
                    priveledges_contacts.contacts_del,
                    priveledges_groups.groups_add,
                    priveledges_groups.groups_edit,
                    priveledges_groups.groups_del,
                    priveledges_template.template_create,
                    priveledges_template.template_edit,
                    priveledges_template.template_del,
                    priveledges_sent.sent_del,
                    priveledges_queue.queue_del
                FROM
                    users
                JOIN
                    priveledges_send,
                    priveledges_inbox,
                    priveledges_contacts,
                    priveledges_groups,
                    priveledges_template,
                    priveledges_sent,
                    priveledges_queue
                ON
                    users.account = priveledges_send.account AND
                    users.account = priveledges_inbox.account AND
                    users.account = priveledges_contacts.account AND
                    users.account = priveledges_groups.account AND
                    users.account = priveledges_template.account AND
                    users.account = priveledges_sent.account AND
                    users.account = priveledges_queue.account
                WHERE
                    users.account = ?
            ` ).get( account )

            if ( priviledges === undefined ) {
                return null
            }

            return {
                account: priviledges.account,
                username: priviledges.username,
                role: priviledges.role,
                priviledges: {
                    send_nmsg: priviledges.send_nmsg === 1 ? true : false,
                    send_fmsg: priviledges.send_fmsg === 1 ? true : false,
                    send_gmsg: priviledges.send_gmsg === 1 ? true : false,
                    inbox_read: priviledges.inbox_read === 1 ? true : false,
                    inbox_del: priviledges.inbox_del === 1 ? true : false,
                    contacts_add: priviledges.contacts_add === 1 ? true : false,
                    contacts_edit: priviledges.contacts_edit === 1 ? true : false,
                    contacts_del: priviledges.contacts_del === 1 ? true : false,
                    groups_add: priviledges.groups_add === 1 ? true : false,
                    groups_edit: priviledges.groups_edit === 1 ? true : false,
                    groups_del: priviledges.groups_del === 1 ? true : false,
                    template_create: priviledges.template_create === 1 ? true : false,
                    template_edit: priviledges.template_edit === 1 ? true : false,
                    template_del: priviledges.template_del === 1 ? true : false,
                    sent_del: priviledges.sent_del === 1 ? true : false,
                    queue_del: priviledges.queue_del === 1 ? true : false
                }
            }

        } catch ( err ) {

            if ( err ) {
                return null
            }

        }

    }

    return {
        props: {
            query: context.query,
            page: 'dashboard',
            tab: context.query.tab === undefined ? 'compose' : context.query.tab,
            user: await user( token ),
            settings: await settings(),
            priviledges: await priviledges( token )
        }
    }

}
