import App , { AppProps , AppContext } from 'next/app'

import { SessionProvider } from 'next-auth/react'

import '@/styles/globals.css'

import ServiceUnavailable from '@/components/503'

function Application ( { Component , pageProps: { session , ... pageProps } , service_status }: AppProps & { service_status: boolean } ): JSX.Element {

    if ( service_status ) { return <ServiceUnavailable /> }

    return <>

    <SessionProvider session={ session } >
        <Component { ... pageProps } />
    </SessionProvider>

    </>

}

Application.getInitialProps = async ( context: AppContext ) => {

    const appProps = await App.getInitialProps( context )

    // enabled/disabled maintenance feature, TN: .env value datatype are "string".
    const service_status = process.env.MAINTENANCE === 'true' ? true : false

    return {
        ... appProps,
        service_status: service_status
    }

}

export default Application
