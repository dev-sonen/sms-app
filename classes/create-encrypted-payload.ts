import { createCipheriv , createDecipheriv , randomBytes } from 'crypto'

class CreateEncryptedPayload {

    wrap ( payload: string | number | boolean | {} | any[] ): string {

        const AES256_ENCRYP = this.encrypt( payload )

        const hexChar: string = '0123456789abcdef'

        const shiftKey: string = this.shuffleArray( hexChar.split( '' ) ).join( '' )
        const shiftBy: number = this.randomShift( AES256_ENCRYP.length )

        const left = AES256_ENCRYP.substring( 0 , shiftBy )
        const right = AES256_ENCRYP.substring( shiftBy , AES256_ENCRYP.length )
        
        if ( String( left + right ) === AES256_ENCRYP ) {
    
            const AES256_ENCRYP_SHIFT: string = right + left
    
            const skey = shiftKey.split( '' )
            
            const applyProcess = AES256_ENCRYP_SHIFT.split( '' ).map( ( arr , ind ) => {
                
                let s: number = 0        
                let e: number = ind + 1
                let placeholder: string[] = []
    
                switch( arr.substring( s , e ) ) {
                    
                    case '0':   placeholder[ s ] = skey[ 0 ]
                                break
                    case '1':   placeholder[ s ] = skey[ 1 ]
                                break
                    case '2':   placeholder[ s ] = skey[ 2 ]
                                break
                    case '3':   placeholder[ s ] = skey[ 3 ]
                                break
                    case '4':   placeholder[ s ] = skey[ 4 ]
                                break
                    case '5':   placeholder[ s ] = skey[ 5 ]
                                break
                    case '6':   placeholder[ s ] = skey[ 6 ]
                                break
                    case '7':   placeholder[ s ] = skey[ 7 ]
                                break
                    case '8':   placeholder[ s ] = skey[ 8 ]
                                break
                    case '9':   placeholder[ s ] = skey[ 9 ]
                                break
                    case 'a':   placeholder[ s ] = skey[ 10 ]
                                break
                    case 'b':   placeholder[ s ] = skey[ 11 ]
                                break
                    case 'c':   placeholder[ s ] = skey[ 12 ]
                                break
                    case 'd':   placeholder[ s ] = skey[ 13 ]
                                break
                    case 'e':   placeholder[ s ] = skey[ 14 ]
                                break
                    case 'f':   placeholder[ s ] = skey[ 15 ]
                                break
                }
    
                s++
                e++
    
                return placeholder.join( '' )
    
            } )
    
            const p = applyProcess.join( '' )
            const k = this.encrypt( `${ shiftKey }` )
            const s = this.encrypt( `${ shiftBy }` )

            const encrypted: string = String( p + k + s )
            
            return encrypted

        } 

        return ''

    }

    parse ( payload: string ): any {
        
        const ENCRYPTED_PAYLOAD = payload.substring( 0 , payload.length - 288 )

        const key = payload.substring( payload.length - 288 , payload.length - 128 )
        const shift = payload.substring( payload.length - 128 , payload.length )

        const dkey = String( this.decrypt( key ) )
        const dshift = Number( this.decrypt( shift ) )

        const skey = dkey.split( '' )

        const applyProcess = ENCRYPTED_PAYLOAD.split( '' ).map( ( arr , ind ) => {

            let s: number = 0      
            let e: number = ind + 1
            let placeholder: string[] = []

            switch( arr.substring( s , e ) ) {
                     
                case skey[ 0 ]:     placeholder[ s ] = '0'
                                    break
                case skey[ 1 ]:     placeholder[ s ] = '1'
                                    break
                case skey[ 2 ]:     placeholder[ s ] = '2'
                                    break
                case skey[ 3 ]:     placeholder[ s ] = '3'
                                    break
                case skey[ 4 ]:     placeholder[ s ] = '4'
                                    break
                case skey[ 5 ]:     placeholder[ s ] = '5'
                                    break
                case skey[ 6 ]:     placeholder[ s ] = '6'
                                    break
                case skey[ 7 ]:     placeholder[ s ] = '7'
                                    break
                case skey[ 8 ]:     placeholder[ s ] = '8'
                                    break
                case skey[ 9 ]:     placeholder[ s ] = '9'
                                    break
                case skey[ 10 ]:    placeholder[ s ] = 'a'
                                    break
                case skey[ 11 ]:    placeholder[ s ] = 'b'
                                    break
                case skey[ 12 ]:    placeholder[ s ] = 'c'
                                    break
                case skey[ 13 ]:    placeholder[ s ] = 'd'
                                    break
                case skey[ 14 ]:    placeholder[ s ] = 'e'
                                    break
                case skey[ 15 ]:    placeholder[ s ] = 'f'
                                    break
            }

            s++
            e++

            return placeholder.join( '' )

        } )

        const AES256_ENCRYP_SHIFT = applyProcess.join( '' )

        const left = AES256_ENCRYP_SHIFT.substring( 0 , AES256_ENCRYP_SHIFT.length - dshift )
        const right = AES256_ENCRYP_SHIFT.substring( AES256_ENCRYP_SHIFT.length - dshift , AES256_ENCRYP_SHIFT.length )

        if ( String( left + right ) === AES256_ENCRYP_SHIFT ) {

            const AES256_ENCRYP: string = right + left

            const parseData = this.decrypt( AES256_ENCRYP )

            return parseData

        }

        return null

    }

    private encrypt ( payload: string | number | boolean | {} | any[] ): string {

        const key = randomBytes( 32 )
        const iv = randomBytes( 16 )

        const hexkey = key.toString( 'hex' )
        const hexiv = iv.toString( 'hex' )

        const cipher = createCipheriv ( 'aes256' , key , iv )
        const encrypted = cipher.update( JSON.stringify( payload ) , 'utf8' , 'hex' ) + cipher.final( 'hex' )

        const AES256_ENCRYP: string = String( encrypted + hexkey + hexiv )

        return AES256_ENCRYP

    }

    private decrypt ( payload: string ): any {

        const AES256_ENCRYP = payload

        const encrypted: string = AES256_ENCRYP.slice( 0 , AES256_ENCRYP.length - 96 )
        const hexkey: string = AES256_ENCRYP.slice( AES256_ENCRYP.length - 96 , AES256_ENCRYP.length - 32 )
        const hexiv: string = AES256_ENCRYP.slice( AES256_ENCRYP.length - 32 , AES256_ENCRYP.length )
        
        const decipher = createDecipheriv( 'aes256' , Buffer.from( hexkey , 'hex' ) , Buffer.from( hexiv , 'hex' ) )
        const decrypted = decipher.update( encrypted , 'hex' , 'utf8' ) + decipher.final( 'utf-8' )

        return JSON.parse( decrypted )

    }

    private shuffleArray ( arr: any[] ): any[] {

        let ran , asd

        for ( let ind = arr.length - 1 ; ind > 0 ; ind -- ) {
            
            ran = Math.round( Math.random() * ind )
            asd = arr[ ran ]
            arr[ ran ] = arr[ ind ]
            arr[ ind ] = asd
            
        }

        return arr

    }

    private randomShift ( length: number ): number {

        return Math.round( Math.random() * length )

    }

}

export default CreateEncryptedPayload
