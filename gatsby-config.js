module.exports = {
  siteMetadata: {
    title: `Porto`,
    description: `Streaming + music generation. Licensed originals, personal variations and connected royalties.`,
    siteUrl: `https://www.portolabs.xyz`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Porto`,
        short_name: `Porto`,
        start_url: `/`,
        background_color: `#111211`,
        theme_color: `#ee6251`,
        display: `standalone`,
        icon: `static/images/porto-mark-dark-branded.png`,
      },
    },
  ],
}
