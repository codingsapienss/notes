// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Notes',
  tagline: 'Personal Knowledge Base & Engineering Handbook',
  favicon: 'img/favicon.ico',
  url: 'https://codingsapienss.github.io',
  baseUrl: '/notes/',
  organizationName: 'codingsapienss',
  projectName: 'notes',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/codingsapienss/notes/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Knowledge Base',
        logo: {
          alt: 'Notes Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/docs/dsa',
            position: 'left',
            label: 'All Notes',
          },
          {
            href: 'https://github.com/codingsapienss/notes',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `Built with ❤️ by codingsapienss • © ${new Date().getFullYear()} Notes`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
