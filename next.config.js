/** @type { import( 'next' ).NextConfig } */

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                /*
                    you need to add remote patterns if you want to access
                    files in a local ip host with specific port.
                */
                protocol: 'http',
                hostname: '192.168.1.205',
                port: '3001',
            },
            {
                protocol: 'http',
                hostname: '192.168.10.205',
                port: '3001',
            },
        ]
    }
}

module.exports = nextConfig
