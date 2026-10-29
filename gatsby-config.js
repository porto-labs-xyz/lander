module.exports = {
  siteMetadata: {
    title: `FREQ by Porto Labs`,
    description: `A new kind of creative system. Where AI, imagination and personal computing meet.`,
    siteUrl: `https://www.portolabs.xyz`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `FREQ by Porto Labs`,
        short_name: `FREQ`,
        start_url: `/`,
        background_color: `#251820`,
        theme_color: `#d9e867`,
        display: `standalone`,
        icon: `static/images/porto-mark-dark-branded.png`,
      },
    },
  ],
}
