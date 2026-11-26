module.exports = {
  siteMetadata: {
    title: `Kiln by Porto Labs`,
    description: `Private AI. Local production.`,
    siteUrl: `https://www.portolabs.xyz`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Kiln by Porto Labs`,
        short_name: `Kiln`,
        start_url: `/`,
        background_color: `#f2f1f4`,
        theme_color: `#6f36bd`,
        display: `standalone`,
        icon: `static/assets/kiln/kiln-crucible-ink.svg`,
      },
    },
  ],
}
