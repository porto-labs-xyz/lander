const siteUrl = 'https://letskiln.xyz'
const sharingOrigin = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : siteUrl

module.exports = {
  siteMetadata: {
    title: `Kiln by Porto Labs`,
    description: `Private AI. Local production.`,
    siteUrl,
    sharingOrigin,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Kiln by Porto Labs`,
        short_name: `Kiln`,
        start_url: `/`,
        background_color: `#f6f6f2`,
        theme_color: `#f6f6f2`,
        display: `standalone`,
        icon: `static/favicon.png`,
      },
    },
  ],
}
