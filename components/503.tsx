import Head from 'next/head'

interface Props {}

export default function ServiceUnavailable ( props: Props ): JSX.Element {

    return <>

    <Head>
        <title>service unavailable</title>
        <meta name='description' content='were currently under maintenance, please come back again later.' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/app-icon.png' />
    </Head>

    <main className='bg-white h-screen w-screen p-5'>
        <h1 className='text-gray-950 font-open-sans-light capitalize'>503 service unavailable.</h1>
    </main>

    </>

}
