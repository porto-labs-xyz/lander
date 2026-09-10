module.exports = {
  siteMetadata: {
    title: `Porto`,
    description: `Artist-owned streaming infrastructure`,
    siteUrl: `https://www.portolabs.xyz`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Porto`,
        short_name: `Porto`,
        start_url: `/`,
        background_color: `#1b1a17`,
        theme_color: `#ee6251`,
        display: `standalone`,
        icon: `static/favicon.png`,
      },
    },
  ],
}
