import Head from 'next/head'

interface Props {}

export default function PageNotFound ( props: Props ): JSX.Element {

    return <>

    <Head>
        <title>page not found</title>
        <meta name='description' content='the page you were looking for does not exist.' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/app-icon.png' />
    </Head>

    <main className='bg-white h-screen w-screen p-5'>
        <h1 className='text-gray-950 font-open-sans-light capitalize'>404 page not found.</h1>
    </main>

    </>

}
