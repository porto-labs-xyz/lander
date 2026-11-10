module.exports = {
  siteMetadata: {
    title: `Kiln by Porto Labs`,
    description: `Private creative AI. A space for your imagination.`,
    siteUrl: `https://www.portolabs.xyz`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Kiln by Porto Labs`,
        short_name: `Kiln`,
        start_url: `/`,
        background_color: `#f1f0ec`,
        theme_color: `#003bff`,
        display: `standalone`,
        icon: `static/favicon.png`,
      },
    },
  ],
}
