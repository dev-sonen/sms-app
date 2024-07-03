import validator from 'validator'

const validate = {
    name: function ( params: { name: string } = { name: '' } ): { pass: boolean , msg: string , value: string | null } | void {

        try {

            if ( params.name === '' ) {
                return {
                    pass: false,
                    msg: 'name field is empty.',
                    value: null
                }
            }
            
            const validate_name: boolean = validator.isAlpha( params.name , 'en-US' , { ignore: ' ' } )
            const validate_length_low: boolean = params.name.length >= 6 ? true : false
            const validate_length_high: boolean = params.name.length <= 30 ? true : false

            if ( validate_length_low === false ) {
                return {
                    pass: false,
                    msg: 'name must atleast 6 letters long.',
                    value: null
                }
            }

            if ( validate_length_high === false ) {
                return {
                    pass: false,
                    msg: 'name must not exceed 30 letters.',
                    value: null
                }
            }

            if ( validate_name ) {
                return {
                    pass: true,
                    msg: '',
                    // these will remove 2 instance of whitespaces.
                    value: params.name.replace( /\s\s/g , '' )
                }
            }

            return {
                pass: false,
                msg: 'name field cannot contain numbers or special characters.',
                value: null
            }

        } catch ( err ) {
            
            if ( err ) {

                console.error( err )
                return {
                    pass: false,
                    msg: 'an error occurred.',
                    value: null
                }

            }

        }

    },
    username: function ( params: { username: string } = { username: '' } ): { pass: boolean , msg: string , value: string | null } | void {

        try {

            if ( params.username === '' ) {
                return {
                    pass: false,
                    msg: 'username field is empty.',
                    value: null
                }
            }

            const validate_username: boolean = validator.isAlphanumeric( params.username , 'en-US' , { ignore: '@_' } )
            const validate_length_low: boolean = params.username.length >= 6 ? true : false
            const validate_length_high: boolean = params.username.length <= 30 ? true : false

            if ( validate_length_low === false ) {
                return {
                    pass: false,
                    msg: 'username must atleast 6 characters long.',
                    value: null
                }
            }

            if ( validate_length_high === false ) {
                return {
                    pass: false,
                    msg: 'username must not exceed 30 characters.',
                    value: null
                }
            }

            if ( validate_username ) {
                return {
                    pass: true,
                    msg: '',
                    value: params.username
                }
            }

            return {
                pass: false,
                msg: 'invalid username.',
                value: null
            }

        } catch ( err ) {

            if ( err ) {

                console.error( err )
                return {
                    pass: false,
                    msg: 'an error occurred.',
                    value: null
                }

            }

        }

    },
    password: function ( params: { password_a: string , password_b: string } = { password_a: '' , password_b: '' } ): { pass: boolean , msg: string , value: string | null } | void {

        try {

            if ( params.password_a === '' || params.password_b === '' ) {

                return {
                    pass: false,
                    msg: 'one or more password fields are empty.',
                    value: null
                }

            }

            const validate_password: boolean = validator.isAlphanumeric( params.password_a , 'en-US' , { ignore: '@' } )
            const validate_length: boolean = params.password_a.length >= 6 ? true : false
            const validate_equal: boolean = params.password_a === params.password_b ? true : false

            if ( validate_equal === false ) {
                return {
                    pass: false,
                    msg: 'passwords does not match.',
                    value: null
                }
            }
            
            if ( validate_length === false ) {                
                return {
                    pass: false,
                    msg: 'passwords must atleast 6 characters long.',
                    value: null
                }
            }

            if ( validate_password && validate_length && validate_equal ) {
                return {
                    pass: true,
                    msg: '',
                    value: params.password_a
                }
            }

            return {
                pass: false,
                msg: 'passwords cannot contain special characters except for @ symbol.',
                value: null
            }

        } catch ( err ) {

            if ( err ) {

                console.error( err )
                return {
                    pass: false,
                    msg: 'an error occurred.',
                    value: null
                }

            }

        }

    },
    groupname: function ( params: { name: string } = { name: '' } ): { pass: boolean , msg: string , value: string | null } | void {

        try {

            if ( params.name === '' ) {
                return {
                    pass: false,
                    msg: 'please enter group name.',
                    value: null
                }
            }

            const validate_groupname: boolean = validator.isAlpha( params.name , 'en-US' , { ignore: ' ' } )

            if ( validate_groupname ) {
                return {
                    pass: true,
                    msg: '',
                    value: params.name
                }
            }

            return {
                pass: false,
                msg: 'group name cannot contain numbers, special characters.',
                value: null
            }

        } catch ( err ) {

            if ( err ) {

                console.error( err )
                return {
                    pass: false,
                    msg: 'an error occurred.',
                    value: null
                }

            }

        }

    },
    location: function ( params: { location: string } = { location: '' } ): { pass: boolean , msg: string , value: string | null } | void {

        try {

            if ( params.location === '' ) {

                return {
                    pass: true,
                    msg: '',
                    value: ''
                }

            } else {

                const validate_location: boolean = validator.isAlphanumeric( params.location , 'en-US' , { ignore: ' .,-#' } )

                if ( validate_location ) {
                    return {
                        pass: true,
                        msg: '',
                        value: params.location
                    }
                }

                return {
                    pass: false,
                    msg: 'location cannot contain special characters except .,-#',
                    value: null
                }

            }

        } catch ( err ) {

            if ( err ) {

                console.error( err )
                return {
                    pass: false,
                    msg: 'an error occurred.',
                    value: null
                }
                
            }

        }

    },
    mapaxis: function ( params: { axis: string } = { axis: '' } ): { pass: boolean , msg: string , value: string | null } | void {

        try {

            if ( params.axis === '' ) {
                
                return {
                    pass: true,
                    msg: '',
                    value: ''
                }

            } else {

                const validate_axis: boolean = validator.isNumeric( params.axis )
    
                if ( validate_axis ) {
                    return {
                        pass: true,
                        msg: '',
                        value: params.axis
                    }
                }
    
                return {
                    pass: false,
                    msg: 'invalid input.',
                    value: null
                }

            }

        } catch ( err ) {

            if ( err ) {

                console.error( err )
                return {
                    pass: false,
                    msg: 'an error occurred.',
                    value: null
                }
                
            }

        }

    },
    mobileno: function ( params: { no: string } = { no: '' } ): { pass: boolean , msg: string , value: string | null } | void {

        try {

            if ( params.no === '' ) {
                return {
                    pass: false,
                    msg: 'please enter mobile no.',
                    value: null
                }
            }

            const validate_mobileno: boolean = validator.isNumeric( params.no )
            const validate_length: boolean = params.no.length >= 11
            const check_code = /^0895|0896|0897|0898|0991|0992|0993|0994|0908|0918|0919|0920|0921|0928|0929|0939|0946|0947|0949|0951|0961|0998|0999|0907|0909|0910|0912|0930|0938|0946|0948|0950|0922|0923|0924|0925|0931|0932|0933|0934|0940|0941|0942|0943|0973|0974|0817|09173|09175|09176|09178|09253|09255|09256|09257|09258|0905|0906|0915|0916|0917|0926|0927|0935|0936|0937|0945|0953|0954|0955|0956|0965|0966|0967|0975|0976|0977|0978|0979|0995|0996|0997/g.test( params.no )

            if ( check_code === false ) {
                return {
                    pass: false,
                    msg: 'unknown network.',
                    value: null
                }
            }

            if ( validate_length === false ) {
                return {
                    pass: false,
                    msg: 'mobile no. must atleast 11 digits.',
                    value: null
                }
            }

            if ( validate_mobileno && validate_length ) {
                return {
                    pass: true,
                    msg: '',
                    value: params.no
                }
            }

            return {
                pass: false,
                msg: 'invalid no.',
                value: null
            }

        } catch ( err ) {

            if ( err ) {

                console.error( err )
                return {
                    pass: false,
                    msg: 'an error occurred.',
                    value: null
                }
                
            }

        }

    },
    contactname: function ( params: { name: string }  = { name: '' } ): { pass: boolean , msg: string , value: string | null } | void {

        try {

            if ( params.name === '' ) {

                return {
                    pass: true,
                    msg: '',
                    value: ''
                }

            } else {

                const validate_contactname: boolean = validator.isAlpha( params.name , 'en-US' , { ignore: ' ' } )

                if ( validate_contactname ) {
                    return {
                        pass: true,
                        msg: '',
                        value: params.name
                    }
                }

                return {
                    pass: false,
                    msg: 'contact name cannot contain numbers and special characters.',
                    value: null
                }

            }

        } catch ( err ) {

            if ( err ) {

                console.error( err )
                return {
                    pass: false,
                    msg: 'an error occurred.',
                    value: null
                }
                
            }

        }

    }
}

export default validate
