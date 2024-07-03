import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

import { db } from '@/config/sqlite.config'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'

import Signin from '@/components/signin'
import Footer from '@/components/footer'

import { Loader } from '@/components/icons'

interface Props {
    csrfToken: string
    settings: any
}

export default function Index ( props: Props ): JSX.Element {

    const {
        csrfToken,
        settings
    } = props

    const { data: session , status }: any = useSession()
    const token: string = new CreateEncryptedPayload().wrap( session ? session.account : 'no-user' )

    const router = useRouter()

    switch ( status ) {

        case 'loading':

            return  <>

            <Head>
                <title>This may take a few seconds...</title>
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

            setTimeout( () => router.push( `/dashboard?token=${ token }` ) , 1000 )

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

        <Signin
            csrfToken={ csrfToken }
            status={ status }
            settings={ settings }
        />

        <Footer />

    </main>

    </>

}

const getCsrfTokenAndSetCookies = async ( context: any ) => {

    const baseUrl = process.env.NEXTAUTH_URL || `https://${ process.env.VERCEL_URL }`
    const host = typeof context.query?.callbackUrl === 'string' && context.query?.callbackUrl.startsWith( baseUrl )
                    ?   context.query?.callbackUrl
                    :   baseUrl

    const redirectURL = encodeURIComponent( host )
    const res = await axios.get( `${ baseUrl }/api/auth/csrf?callbackUrl=${ redirectURL }` )

    const { csrfToken } = res.data
    const headers = res.headers

    // @ts-ignore
    const [ csrfCookie , redirectCookie ] = headers[ 'set-cookie' ]
    
    context.res.setHeader( 'set-cookie' , [ csrfCookie , redirectCookie ] )
    
    return csrfToken

}

export const getServerSideProps: GetServerSideProps = async ( context ) => {

    const csrfToken = await getCsrfTokenAndSetCookies( context )

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
            csrfToken: csrfToken,
            settings: await settings()
        }
    }

}
