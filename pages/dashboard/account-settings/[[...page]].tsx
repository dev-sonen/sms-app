import { useState } from 'react'

import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import { useSession } from 'next-auth/react'

import { db } from '@/config/sqlite.config'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'

import MainNavbar from '@/components/main-navbar'
import AccountSettingsMain from '@/components/account-settings/account-settings-main'
import { Loader } from '@/components/icons'

interface Props {
    query: string
    page: string
    tab: any
    user: any
    settings: any
}

export default function Page ( props: Props ): JSX.Element {

    const {
        query,
        page,
        tab,
        user,
        settings
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
                    <title>account settings</title>
                    <meta name='description' content='' />
                    <meta name='viewport' content='width=device-width, initial-scale=1' />
                    <link rel='icon' href='/app-icon.png' />
                </Head>

                <div className='h-screen w-screen'>

                    <div className='flex w-full h-full'>
                        <MainNavbar
                            query={ query }
                            page={ page }
                            slide={ slide }
                            setSlide={ setSlide }
                        />
                        <div className='pl-0 md:pl-72 w-full h-full transition-all ease-in-out duration-300'>
                            <AccountSettingsMain
                                query={ query }
                                user={ user }
                                settings={ settings }
                                page={ page }
                                tab={ tab }
                                slide={ slide }
                                setSlide={ setSlide }
                            />
                        </div>
                    </div>
                
                </div>

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
                image: find_user.image,
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

    return {
        props: {
            query: context.query,
            page: 'account settings',
            tab: context.query.page === undefined ? 'credentials' : context.query.page[ 0 ],
            user: await user( token ),
            settings: await settings()
        }
    }

}
