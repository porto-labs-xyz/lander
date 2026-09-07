module.exports = {
  siteMetadata: {
    title: `Porto`,
    description: `Decentralized Streaming Infrastructure`,
    siteUrl: `https://www.portolabs.xyz`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Porto`,
        short_name: `Porto`,
        start_url: `/`,
        background_color: `#0a0a0a`,
        theme_color: `#ff3b3b`,
        display: `standalone`,
        icon: `static/favicon.png`,
      },
    },
  ],
}
