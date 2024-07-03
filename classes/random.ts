// removed! from "GenerateSerial" class and no longer bind.

class Random {

    array ( arr: string[] | number[] ): string[] | number[] {

        if ( arr.length === 0 ) {

            return []

        } else {

            let ran , asd

            for ( let ind = arr.length - 1 ; ind > 0 ; ind -- ) {
                
                ran = Math.round( Math.random() * ind )
                asd = arr[ ran ]
                arr[ ran ] = arr[ ind ]
                arr[ ind ] = asd
                
            }
    
            return arr

        }

    }

    string ( str: string ): string {

        if ( str.trim() === '' || str === null || str === undefined ) {

            return 'invalid string format.'

        } else {

            let arr = str.split( '' )
            let ran , asd

            for ( let ind = arr.length - 1 ; ind > 0 ; ind -- ) {
                
                ran = Math.round( Math.random() * ind )
                asd = arr[ ran ]
                arr[ ran ] = arr[ ind ]
                arr[ ind ] = asd
                
            }
    
            return arr.join( '' )

        }

    }

}

export default Random