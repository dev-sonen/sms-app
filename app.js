const { createServer } = require( 'http' )
const { parse } = require( 'url' )
const next = require( 'next' )

const start = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next( { start , hostname , port } )
const handle = app.getRequestHandler()

app.prepare().then( () => {

    createServer( ( req , res ) => {

        const parsedUrl = parse( req.url , true )
        const { pathname , query } = parsedUrl

        if ( pathname === '/a' ) {
            app.render( req , res , '/a' , query )
        } else if ( pathname === '/b' ) {
            app.render( req , res , '/b' , query )
        } else {
            handle( req , res , parsedUrl )
        }

    } ).listen( port , ( err ) => {

        if ( err ) throw err

        console.log( `app is now running at: http://${ hostname }:${ port }` )

    } )

} )
