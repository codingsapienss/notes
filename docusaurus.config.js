// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DSA Handbook',
  tagline: 'C++ STL Mastery Guide',
  favicon: 'img/favicon.ico',
  url: 'https://codingsapienss.github.io',
  baseUrl: '/DSA/',
  organizationName: 'codingsapienss',
  projectName: 'DSA',
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
          editUrl: 'https://github.com/codingsapienss/DSA/tree/main/',
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
        title: 'DSA Handbook',
        logo: {
          alt: 'DSA Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Handbook',
          },
          {
            href: 'https://github.com/codingsapienss/DSA',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Handbook',
                to: '/docs/',
              },
            ],
          },
          {
            title: 'GitHub',
            items: [
              {
                label: 'Source Code',
                href: 'https://github.com/codingsapienss/DSA',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} DSA Handbook.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
