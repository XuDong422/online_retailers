module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                'assets': '@/assets',
                'views': '@/views',
                'network': '@/network',
                'components': '@/components',
            }
        }
    }
}