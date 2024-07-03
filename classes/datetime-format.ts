type YearDisplay = 'full' | 'trim'
type YearDatatype = 'string' | 'number'

type MonthDisplay = 'full' | 'trim' | 'numerical' | 'numericalwithzeros'

type DateDisplay = 'numerical' | 'numericalwithzeros'

type DayDisplay = 'full' | 'trim'

type HourFormat = '12hr' | '24hr'
type HourDisplay = 'numerical' | 'numericalwithzeros'

type MinutesDisplay = 'numerical' | 'numericalwithzeros'
type SecondsDisplay = 'numerical' | 'numericalwithzeros'

type DateOnly = {
    separator: string
    mm: 'full' | 'trim' | 'numerical' | 'numericalwithzeros'
    dd: 'numerical' | 'numericalwithzeros'
    yy: 'full' | 'trim'
}

type TimeOnly = {
    separator: string
    hh: '12hr' | '24hr'
    hd: 'numerical' | 'numericalwithzeros'
    mn: 'numerical' | 'numericalwithzeros'
    ss: 'numerical' | 'numericalwithzeros'
}

type Full = {
    separator: string
    dseparator: string
    tseparator: string
    mm: 'full' | 'trim' | 'numerical' | 'numericalwithzeros'
    dd: 'numerical' | 'numericalwithzeros'
    yy: 'full' | 'trim'
    hh: '12hr' | '24hr'
    hd: 'numerical' | 'numericalwithzeros'
    mn: 'numerical' | 'numericalwithzeros'
    ss: 'numerical' | 'numericalwithzeros'
}

type DataReturns = 'string' | 'object' | 'array'
type DateReturns = string | { month: string , date: string , year: string } | string[]
type TimeReturns = string | { hour: string , minutes: string , seconds: string } | string[]
type FullReturns = string | { month: string , date: string , year: string , hour: string , minutes: string , seconds: string } | string[]

class DateTimeFormat {

    private fmonth: string[] = [ 'january' , 'february' , 'march' , 'april' , 'may' , 'june' , 'july' , 'august' , 'september' , 'october' , 'november' , 'december' ]
    private tmonth: string[] = [ 'jan' , 'feb' , 'mar' , 'apr' , 'may' , 'jun' , 'jul' , 'aug' , 'sep' , 'oct' , 'nov' , 'dec' ]
    private nmonth: string[] = [ '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , '11' , '12' ]
    private zmonth: string[] = [ '01' , '02' , '03' , '04' , '05' , '06' , '07' , '08' , '09' , '10' , '11' , '12' ]

    private tday: string[] = [ 'sun' , 'mon' , 'tue' , 'wed' , 'thu' , 'fri' , 'sat' ]
    private fday: string[] = [ 'sunday' , 'monday' , 'tuesday' , 'wednesday' , 'thursday' , 'friday' , 'saturday' ]

    private nhour12: string[] = [ '12' , '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , '11' , '12' , '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , '11' ]
    private nhour24: string[] = [ '0' , '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , '11' , '12' , '13' , '14' , '15' , '16' , '17' , '18' , '19' , '20' , '21' , '22' , '23' ]
    private zhour12: string[] = [ '12' , '01' , '02' , '03' , '04' , '05' , '06' , '07' , '08' , '09' , '10' , '11' , '12' , '01' , '02' , '03' , '04' , '05' , '06' , '07' , '08' , '09' , '10' , '11' ]
    private zhour24: string[] = [ '00' , '01' , '02' , '03' , '04' , '05' , '06' , '07' , '08' , '09' , '10' , '11' , '12' , '13' , '14' , '15' , '16' , '17' , '18' , '19' , '20' , '21' , '22' , '23' ]

    utcdatetime: Date

    constructor( utcdatetime: Date ) {
        this.utcdatetime = utcdatetime
    }

    year ( opt: { display: YearDisplay , datatype: YearDatatype } = { display: 'full' , datatype: 'string' } ): string | number | void {

        switch ( opt.display ) {

            default:
            throw new Error( 'invalid display parameter.' )
            
            case 'full':
            switch ( opt.datatype ) {

                default:
                throw new Error( 'invalid datatype parameter.' )
                
                case 'number':
                return Number( this.utcdatetime.getFullYear() )
                
                case 'string':
                return String( this.utcdatetime.getFullYear() )

            }
            
            case 'trim':
            switch ( opt.datatype ) {

                default:
                throw new Error( 'invalid datatype parameter.' )
                
                case 'number':
                return Number( String( this.utcdatetime.getFullYear() ).substring( String( this.utcdatetime.getFullYear() ).length - 2 , String( this.utcdatetime.getFullYear() ).length ) )
                
                case 'string':
                return String( this.utcdatetime.getFullYear() ).substring( String( this.utcdatetime.getFullYear() ).length - 2 , String( this.utcdatetime.getFullYear() ).length )

            }

        } 

    }

    month ( opt: { display: MonthDisplay } = { display: 'full' } ): string | void {

        switch ( opt.display ) {

            default:
            throw new Error( 'invalid display parameter.' )
            
            case 'full':
            return this.fmonth[ this.utcdatetime.getMonth() ]
            
            case 'trim':
            return this.tmonth[ this.utcdatetime.getMonth() ]
            
            case 'numerical':
            return this.nmonth[ this.utcdatetime.getMonth() ]

            case 'numericalwithzeros':
            return this.zmonth[ this.utcdatetime.getMonth() ]

        }  

    }

    date ( opt: { display: DateDisplay } = { display: 'numericalwithzeros' } ): string | void {

        switch ( opt.display ) {

            default:
            throw new Error( 'invalid display parameter.' )

            case 'numerical':
            return String( this.utcdatetime.getDate() )

            case 'numericalwithzeros':
            return this.utcdatetime.getDate() < 10 ? String( `0${ this.utcdatetime.getDate() }` ) : String( this.utcdatetime.getDate() )

        }

    }

    day ( opt: { display: DayDisplay } = { display: 'full' } ): string | void {

        switch ( opt.display ) {

            default:
            throw new Error( 'invalid display parameter.' )

            case 'full':
            return this.fday[ this.utcdatetime.getDay() ]

            case 'trim':
            return this.tday[ this.utcdatetime.getDay() ]

        }

    }

    hour ( opt: { format: HourFormat , display: HourDisplay } = { format: '24hr' , display: 'numericalwithzeros' } ): string | void {

        switch ( opt.format ) {

            default:
            throw new Error( 'invalid format parameter.' )

            case '12hr':
            switch ( opt.display ) {

                default:
                throw new Error( 'invalid display parameter.' )

                case 'numerical':
                return this.nhour12[ this.utcdatetime.getHours() ]

                case 'numericalwithzeros':
                return this.zhour12[ this.utcdatetime.getHours() ]

            }

            case '24hr':
            switch ( opt.display ) {

                default:
                throw new Error( 'invalid display parameter.' )

                case 'numerical':
                return this.nhour24[ this.utcdatetime.getHours() ]

                case 'numericalwithzeros':
                return this.zhour24[ this.utcdatetime.getHours() ]

            }


        }

    }

    minutes ( opt: { display: MinutesDisplay } = { display: 'numericalwithzeros' } ): string | void {

        switch ( opt.display ) {

            default:
            throw new Error( 'invalid display parameter.' )

            case 'numericalwithzeros':
            return this.utcdatetime.getMinutes() < 10 ? String( `0${ this.utcdatetime.getMinutes() }` ) : String( this.utcdatetime.getMinutes() )

            case 'numerical':
            return String( this.utcdatetime.getMinutes() )
        }

    }

    seconds ( opt: { display: SecondsDisplay } = { display: 'numericalwithzeros' } ): string | void {

        switch ( opt.display ) {

            default:
            throw new Error( 'invalid display parameter.' )

            case 'numericalwithzeros':
            return this.utcdatetime.getSeconds() < 10 ? String( `0${ this.utcdatetime.getSeconds() }` ) : String( this.utcdatetime.getSeconds() )

            case 'numerical':
            return String( this.utcdatetime.getSeconds() )
        }

    }

    cycle (): string {

        return this.utcdatetime.getHours() < 12 ? 'am' : 'pm'

    }

    dateOnly ( returns: DateReturns = 'string' , opt: DateOnly = { separator: '-' , mm: 'full' , dd: 'numericalwithzeros' , yy: 'full' } ): DateReturns | void {

        switch ( returns ) {

            default:
            throw new Error( 'invalid returns parameter.' )

            case 'string':
            return String( `${ this.month( { display: opt.mm } ) }${ opt.separator }${ this.date( { display: opt.dd } ) }${ opt.separator }${ this.year( { display: opt.yy , datatype: 'string' } ) }` )

            case 'object':
            return {
                month: String( this.month( { display: opt.mm } ) ),
                date: String( this.date( { display: opt.dd } ) ),
                year: String( this.year( { display: opt.yy , datatype: 'string' } ) )
            }

            case 'array':
            return [ 
                String( this.month( { display: opt.mm } ) ),
                String( this.date( { display: opt.dd } ) ),
                String( this.year( { display: opt.yy , datatype: 'string' } ) )
            ]

        }


    }

    timeOnly ( returns: DateReturns = 'string' , opt: TimeOnly = { separator: ':' , hh: '24hr' , hd: 'numericalwithzeros' , mn: 'numericalwithzeros' , ss: 'numericalwithzeros' } ): TimeReturns | void {

        switch ( returns ) {

            default:
            throw new Error( 'invalid returns parameter.' )

            case 'string':
            return String( `${ this.hour( { format: opt.hh , display: opt.hd } ) }${ opt.separator }${ this.minutes( { display: opt.mn } ) }${ opt.separator }${ this.seconds( { display: opt.ss } ) }` )

            case 'object':
            return {
                hour: String( this.hour( { format: opt.hh , display: opt.hd } ) ),
                minutes: String( this.minutes( { display: opt.mn } ) ),
                seconds: String( this.seconds( { display: opt.ss } ) )
            }

            case 'array':
            return [
                String( this.hour( { format: opt.hh , display: opt.hd } ) ),
                String( this.minutes( { display: opt.mn } ) ),
                String( this.seconds( { display: opt.ss } ) )
            ]

        }

    }

    full ( returns: DateReturns = 'string' , opt: Full = { separator: ' ' , dseparator: '-' , tseparator: ':' , mm: 'full' , dd: 'numericalwithzeros' , yy: 'full' , hh: '24hr' , hd: 'numericalwithzeros' , mn: 'numericalwithzeros' , ss: 'numericalwithzeros' } ): FullReturns | void {

        switch ( returns ) {

            default:
            throw new Error( 'invalid returns parameter.' )

            case 'string':
            return String( `${ this.month( { display: opt.mm } ) }${ opt.dseparator }${ this.date( { display: opt.dd } ) }${ opt.dseparator }${ this.year( { display: opt.yy , datatype: 'string' } ) }${ opt.separator }${ this.hour( { format: opt.hh , display: opt.hd } ) }${ opt.tseparator }${ this.minutes( { display: opt.mn } ) }${ opt.tseparator }${ this.seconds( { display: opt.ss } ) } ${ opt.hh === '12hr' ? this.cycle().toUpperCase() : '' }` )

            case 'object':
            return {
                month: String( this.month( { display: opt.mm } ) ),
                date: String( this.date( { display: opt.dd } ) ),
                year: String( this.year( { display: opt.yy , datatype: 'string' } ) ),
                hour: String( this.hour( { format: opt.hh , display: opt.hd } ) ),
                minutes: String( this.minutes( { display: opt.mn } ) ),
                seconds: String( this.seconds( { display: opt.ss } ) )
            }

            case 'array':
            return [
                String( this.month( { display: opt.mm } ) ),
                String( this.date( { display: opt.dd } ) ),
                String( this.year( { display: opt.yy , datatype: 'string' } ) ),
                String( this.hour( { format: opt.hh , display: opt.hd } ) ),
                String( this.minutes( { display: opt.mn } ) ),
                String( this.seconds( { display: opt.ss } ) )
            ]

        } 

    }

}

export default DateTimeFormat