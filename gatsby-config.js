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
        background_color: `#f1f0ec`,
        theme_color: `#003bff`,
        display: `standalone`,
        icon: `static/assets/kiln/kiln-crucible-ink.svg`,
      },
    },
  ],
}
