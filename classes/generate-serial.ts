type Sets = 'hexlow' | 'hexupp' | 'alphalow' | 'alphaupp' | 'numeric' | 'alphanumericlow' | 'alphanumericupp' | 'alphanumericall'

class GenerateSerial {

    private setof: Sets

    constructor ( opt: { setof: Sets } = { setof: 'hexlow' } ) {
        this.setof = opt.setof
    }

    private sets ( length: number ): string[] {

        switch ( this.setof ) {

            default:
            throw new Error( 'invalid setof parameter.' )

            case 'hexlow':
                const hl: string = '0123456789abcdef'
                let arrhl: string[] = []

                for( let i = 0 ; i < length ; i ++ ) { arrhl.push( hl ) }
                
                return arrhl

            case 'hexupp':
                const hu: string = '0123456789ABCDEF'
                let arrhu: string[] = []
        
                for( let i = 0 ; i < length ; i ++ ) { arrhu.push( hu ) }
        
                return arrhu

            case 'alphalow':
                const al: string = 'abcdefghijklmnopqrstuvwxyz'
                let arral: string[] = []
        
                for( let i = 0 ; i < length ; i ++ ) { arral.push( al ) }
        
                return arral

            case 'alphaupp':
                const au: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                let arrau: string[] = []
        
                for( let i = 0 ; i < length ; i ++ ) { arrau.push( au ) }
        
                return arrau
            
            case 'numeric':
                const n: string = '1234567890'
                let arrn: string[] = []
        
                for( let i = 0 ; i < length ; i ++ ) { arrn.push( n ) }
        
                return arrn

            case 'alphanumericlow':
                const anl: string = 'abcdefghijklmnopqrstuvwxyz1234567890'
                let arranl: string[] = []
        
                for( let i = 0 ; i < length ; i ++ ) { arranl.push( anl ) }
        
                return arranl

            case 'alphanumericupp':
                const anu: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
                let arranu: string[] = []
        
                for( let i = 0 ; i < length ; i ++ ) { arranu.push( anu ) }
        
                return arranu

            case 'alphanumericall':
                const ana: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
                let arrana: string[] = []
        
                for( let i = 0 ; i < length ; i ++ ) { arrana.push( ana ) }
        
                return arrana

        }

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

    keyCode ( opt: { length: number } = { length: 16 } ): string | void {

        if ( opt.length === 0 ) {
            
            throw new Error( 'invalid length parameter.' )
        
        } else {

            const arr_digits: string[] = this.sets( opt.length )

            let arr_cont: Array<any> = []
            let pro_cont: Array<any> = []
    
            arr_digits.map( ( _ , ind ) => arr_cont.push( this.shuffleArray( arr_digits[ ind ].split( '' ) ) ) )
            arr_cont.map( ( _ , ind ) => pro_cont.push( arr_cont[ ind ][ Math.round( Math.random() * 9 ) ] ) )
    
            return pro_cont.join( '' )

        }

    }

    uniqueId ( bind: string | number | void , opt: { length: number , series: number } = { length: 4 , series: 4 } ) {

        let cont: Array<any> = []

        for( let i = 0 ; i < opt.series ; i ++ ) {
            
            cont.push( this.keyCode( { length: opt.length } ) )

        }

        if( bind === '' || bind === null || bind === undefined ) {

            return cont.join( '-' )

        } else {

            return `${ bind }-${ cont.join( '-' ) }`

        }

    }

}

export default GenerateSerial