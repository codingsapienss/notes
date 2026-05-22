/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Basics',
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'STL',
          items: [
            'Basics/STL/part-01_foundation',
            'Basics/STL/part-02_dynamic-containers',
            'Basics/STL/part-03_container-adaptors',
            'Basics/STL/part-04_associative-containers',
            'Basics/STL/part-05_algorithms-and-utility-functions',
            'Basics/STL/part-06_final-revision-handbook',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
