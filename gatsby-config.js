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
        short_name: `FREQ by Porto Labs`,
        start_url: `/`,
        background_color: `#0b0b0d`,
        theme_color: `#c8ff4d`,
        display: `standalone`,
        icon: `static/images/porto-mark-dark-branded.png`,
      },
    },
  ],
}
