class AppConstants{
    public static readonly Logging = {
        levels: {
            info: 'info',
            error: 'error',
            warning: 'warning'
        },
        outputs: {
            error: 'errors.log',
            combined: 'combined.log'
        }
    }

    public static readonly Environments = {
        development: 'development',
        staging: 'staging',
        production: 'production'
    }
}

export default AppConstants;