import { useState , useEffect } from 'react'

import axios from 'axios'
import CreateEncryptedPayload from '@/classes/create-encrypted-payload'
import GenerateSerial from '@/classes/generate-serial'

import Map , { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import ActionCheckMapSend from './action-check-map-send'
import ActionCheckMapPin from './action-check-map-pin'
import ActionCheckMapAddTemplate from './action-check-map-add-template'

interface Props {
    user: any
    query: any
    priviledges: any
}

export default function GuiCheckMap ( props: Props ): JSX.Element {

    const {
        user,
        query,
        priviledges: { priviledges: { send_gmsg , send_fmsg } }
    } = props

    type Classes = { display: string , opacity: string , translate: string }
    const [ classes , setClasses ] = useState <Classes> ( { display: 'hidden' , opacity: 'opacity-0' , translate: '-translate-x-20' } )

    type Fields = { message: string , flash: boolean }
    const [ fields , setFields ] = useState <Fields> ( { message: '' , flash: false } )

    type Warning = { message: string }
    const [ warning , setWarning ] = useState <Warning> ( { message: '' } )

    type Window = {
        template: {
            display: string,
            opacity: string,
            translate: string
        }
    }
    const [ window , setWindow ] = useState <Window> ( {
        template: {
            display: 'hidden',
            opacity: 'opacity-0',
            translate: 'translate-x-10'
        } 
    } )

    /* for groups */
    const [ groups , setGroups ] = useState <Array<any>> ( [] )

    /* for group obj */
    const [ groupObj , setGroupObj ] = useState <any> ( {} )

    /* for DOM change states */
    const [ loading , setLoading ] = useState <boolean> ( false )
    const [ disabled , setDisabled ] = useState <boolean> ( false )

    /* trigger error DOM component */
    const [ error , setError ] = useState <boolean> ( false )

    /* data call */
    useEffect( () => {

        const controller = new AbortController()

        const createEncryptedPayload = new CreateEncryptedPayload()
        const generateSerial = new GenerateSerial()

        get( controller )

        async function get ( controller: any ) {

            setDisabled( true )
            setLoading( true )

            const serial: string = String( generateSerial.keyCode() )
            const encrypt: string = createEncryptedPayload.wrap( {
                serial: serial,
                command: 'search-contacts-within-group',
            } )

            await axios ( {
                signal: controller.signal,
                method: 'post',
                url: `${ process.env.NEXT_PUBLIC_ACCESS_DOMAIN }/api/content/dashboard`,
                data: { payload: encrypt },
                headers: { 'X-Access-Authentication': String( createEncryptedPayload.wrap( serial ) ) }
            } )
            .then ( ( res: any ) => {

                if ( res.status === 200 ) {

                    setGroups( res.data )
                    setError( false )

                    setTimeout( () => {
                        setDisabled( false )
                        setLoading( false )
                    } , 500 )

                }

                else {

                    setGroups( [] )
                    setError( true )

                    setTimeout( () => {
                        setDisabled( false )
                        setLoading( false )
                    } , 500 )

                }

            } )
            .catch ( ( err: any ) => {

                setGroups( [] )
                setError( true )

                if ( err ) {

                    console.error( err.message )

                    setTimeout( () => {
                        setDisabled( false )
                        setLoading( false )
                    } , 500 )

                }

            } )

        }

    } , [] )

    return <>
    
    <div className='grid p-5 gap-3 md:p-10'>

        <div className='relative overflow-auto rounded-xl'>

            <ActionCheckMapSend
                user={ user }
                groupObj={ groupObj }
                fields={ fields }
                setFields={ setFields }
                warning={ warning }
                setWarning={ setWarning }
                classes={ classes }
                setClasses={ setClasses }
                window={ window }
                setWindow={ setWindow }
                send_gmsg={ send_gmsg }
                send_fmsg={ send_fmsg }
            />

            <div className='h-[550px] md:h-[600px] w-full'>
                {
                        loading

                            ?   <div className='flex items-center justify-center h-full'>
                                    <svg className='h-5 w-5 text-gray-500' xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
                                        <circle cx='4' cy='12' r='3' fill='currentColor'>
                                            <animate id='svgSpinners3DotsScale0' attributeName='r' begin='0;svgSpinners3DotsScale1.end-0.25s' dur='0.75s' values='3;.2;3' />
                                        </circle>
                                        <circle cx='12' cy='12' r='3' fill='currentColor'>
                                            <animate attributeName='r' begin='svgSpinners3DotsScale0.end-0.6s' dur='0.75s' values='3;.2;3' />
                                        </circle>
                                        <circle cx='20' cy='12' r='3' fill='currentColor'>
                                            <animate id='svgSpinners3DotsScale1' attributeName='r' begin='svgSpinners3DotsScale0.end-0.45s' dur='0.75s' values='3;.2;3' />
                                        </circle>
                                    </svg>
                                </div>
                    
                    :   !loading && error && groups.length === 0

                            ?   <div className='flex items-center justify-center h-full'>
                                    <div className='flex flex-col items-center space-y-2'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='1em'
                                            height='1em'
                                            viewBox='0 0 24 24'
                                            className='h-10 w-10 text-red-600'
                                        >
                                            <g fill='currentColor'>
                                                <path d='M12.832 21.801c3.126-.626 7.168-2.875 7.168-8.69c0-5.291-3.873-8.815-6.659-10.434c-.617-.36-1.341.113-1.341.828v1.828c0 1.442-.606 4.074-2.29 5.169c-.86.559-1.79-.278-1.894-1.298l-.086-.838c-.1-.974-1.092-1.565-1.87-.971C4.461 8.46 3 10.33 3 13.11C3 20.221 8.289 22 10.933 22c.154 0 .316-.006.484-.015c.446-.056 0 .099 1.415-.185Z' opacity='.5' />
                                                <path d='M8 18.444c0 2.62 2.111 3.43 3.417 3.542c.446-.056 0 .099 1.415-.185C13.871 21.434 15 20.492 15 18.444c0-1.297-.819-2.098-1.46-2.473c-.196-.115-.424.03-.441.256c-.056.718-.746 1.29-1.215.744c-.415-.482-.59-1.187-.59-1.638v-.59c0-.354-.357-.59-.663-.408C9.495 15.008 8 16.395 8 18.445Z' />
                                            </g>
                                        </svg>
                                        <span className='text-gray-950 text-xs font-open-sans-light'>
                                            an error occured.
                                        </span>
                                    </div>
                                </div>

                    :   loading || groups.length === 0

                            ?   <div className='flex items-center justify-center h-full'>
                                    <div className='flex flex-col items-center space-y-2'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='1em'
                                            height='1em'
                                            viewBox='0 0 16 16'
                                            className='h-10 w-10 text-gray-500'
                                        >
                                            <path fill='currentColor' d='M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2ZM6.25 7.5a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5Zm3.5 0a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5Zm.118 3.322a.5.5 0 1 0 .764-.644c-1.325-1.57-3.94-1.57-5.264 0a.5.5 0 1 0 .764.644c.925-1.096 2.81-1.096 3.736 0Z' />
                                        </svg>
                                        <span className='text-gray-950 text-xs font-open-sans-light'>
                                            no groups found or all coordinates are not yet set. 
                                        </span>
                                    </div>
                                </div>

                            :   <Map
                                    initialViewState={ {
                                        latitude: 14.590908457978296,
                                        longitude: 120.98141961258825,
                                        zoom: 6
                                    } }
                                    style={ { width: '100%' , height: '100%' } }
                                    mapStyle='mapbox://styles/dev-sonen/ckzf9nz2h000a14nxm2b235ub?optimize=true'
                                    mapboxAccessToken='pk.eyJ1IjoiZGV2LXNvbmVuIiwiYSI6ImNrem1ob2NrbDBybXIycGxsY2RyODJnem8ifQ.2Fr6dHqD9JNiZtsVW73OqQ'
                                >
                                    {
                                        groups.map( ( obj: any , ind: number ) => (

                                            <Marker key={ ind } latitude={ obj.lat } longitude={ obj.lng }>
                                                <ActionCheckMapPin
                                                    obj={ obj }
                                                    setWarning={ setWarning }
                                                    setClasses={ setClasses }
                                                    setGroupObj={ setGroupObj }
                                                    disabled={ disabled }
                                                />
                                            </Marker>

                                        ) )
                                    }
                                </Map>
                }
            </div>
        </div>

        <ActionCheckMapAddTemplate
            query={ query }
            fields={ fields }
            setFields={ setFields }
            window={ window }
            setWindow={ setWindow }
        />

    </div>
    
    </>

}
