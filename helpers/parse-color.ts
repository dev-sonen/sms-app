const colorParser = {

    background: function ( color: string ): string {
        switch ( color ) {
            default:
            return 'bg-white'

            case 'white':
            return 'bg-white'
    
            case 'green':
            return 'bg-green-500'
    
            case 'blue':
            return 'bg-blue-600'
    
            case 'yellow':
            return 'bg-yellow-400'
    
            case 'red':
            return 'bg-red-600'
    
            case 'sky':
            return 'bg-sky-500'
    
            case 'amber':
            return 'bg-amber-500'
    
            case 'teal':
            return 'bg-teal-600'
    
            case 'purple':
            return 'bg-purple-600'
            
            case 'pink':
            return 'bg-pink-400'
    
            case 'rose':
            return 'bg-rose-600'
            
            case 'gray':
            return 'bg-gray-800'
        }
    },
    border: function ( color: string ): string {
        switch ( color ) {
            default:
            return 'border-gray-200'

            case 'white':
            return 'border-gray-200'
    
            case 'green':
            return 'border-green-500'
    
            case 'blue':
            return 'border-blue-600'
    
            case 'yellow':
            return 'border-yellow-400'
    
            case 'red':
            return 'border-red-600'
    
            case 'sky':
            return 'border-sky-500'
    
            case 'amber':
            return 'border-amber-500'
    
            case 'teal':
            return 'border-teal-600'
    
            case 'purple':
            return 'border-purple-600'
            
            case 'pink':
            return 'border-pink-400'
    
            case 'rose':
            return 'border-rose-600'
            
            case 'gray':
            return 'border-gray-800'
        }
    },
    text: function ( color: string ): string {
        switch ( color ) {
            default:
            return 'text-white'

            case 'white':
            return 'text-white'
    
            case 'green':
            return 'text-green-500'
    
            case 'blue':
            return 'text-blue-600'
    
            case 'yellow':
            return 'text-yellow-400'
    
            case 'red':
            return 'text-red-600'
    
            case 'sky':
            return 'text-sky-500'
    
            case 'amber':
            return 'text-amber-500'
    
            case 'teal':
            return 'text-teal-600'
    
            case 'purple':
            return 'text-purple-600'
            
            case 'pink':
            return 'text-pink-400'
    
            case 'rose':
            return 'text-rose-600'
            
            case 'gray':
            return 'text-gray-800'
        }
    }

}

export default colorParser
