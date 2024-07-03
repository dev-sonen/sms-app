class Paginate {

    private arr: Array <any>
    private size: number

    constructor ( arr: Array <any> , opt: { size: number } ) {

        this.arr = arr
        this.size = opt.size

    }

    getChunk (): { length: number , chunks: Array <any> } {

        let cont: Array <any> = []
        let i: number = 1

        while ( this.getPage( { page: i } ).length !== 0 ) {

            cont.push( this.getPage( { page: i } ) )
            i ++

        }

        return {
            length: cont.length,
            chunks: cont
        }

    }

    private getPage ( opt: { page: number } = { page: 1 } ): Array <any> {

        const istart: number = ( opt.page - 1 ) * this.size
        return this.arr.slice( istart , istart + this.size )

    }

}

export default Paginate 
