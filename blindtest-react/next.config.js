const {join} = require("path");
/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {
        includePaths: [join(__dirname, '/src/styles')],
    },
  redirects: () => {
      return [
          {
            source: '/api/:path*',
            destination: `http://localhost:3000/api/:path*`,
            permanent: true,
          }
      ]
  }
}

module.exports = nextConfig
