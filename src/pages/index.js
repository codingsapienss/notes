import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const HandbookParts = [
  {
    title: 'Part 1: Foundations',
    description: 'Master the basics of C++ STL, arrays, pairs, and vector internals.',
    link: '/docs/',
  },
  {
    title: 'Part 2: Dynamic Containers',
    description: 'Deep dive into Vectors, Lists, and Deques for flexible data storage.',
    link: '/docs/Basics/STL/part-02_dynamic-containers',
  },
  {
    title: 'Part 3: Container Adaptors',
    description: 'Understand Stacks, Queues, and Priority Queues for restricted interfaces.',
    link: '/docs/Basics/STL/part-03_container-adaptors',
  },
  {
    title: 'Part 4: Associative Containers',
    description: 'Efficiently manage unique data with Sets, Multisets, and Maps.',
    link: '/docs/Basics/STL/part-04_associative-containers',
  },
  {
    title: 'Part 5: Algorithms',
    description: 'Level up with sorting, searching, and built-in STL utility functions.',
    link: '/docs/Basics/STL/part-05_algorithms-and-utility-functions',
  },
  {
    title: 'Part 6: Revision Handbook',
    description: 'A concise summary and quick reference for last-minute revisions.',
    link: '/docs/Basics/STL/part-06_final-revision-handbook',
  },
];

function HandbookCard({title, description, link}) {
  return (
    <div className="col col--4 margin-bottom--lg">
      <Link className="card" to={link} style={{textDecoration: 'none'}}>
        <div className="card__header">
          <Heading as="h3">{title}</Heading>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            Start Reading Now 📖
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Modern C++ STL Handbook for Data Structures and Algorithms">
      <HomepageHeader />
      <main>
        <div className="container" style={{padding: '4rem 0'}}>
          <div className="row">
            {HandbookParts.map((props, idx) => (
              <HandbookCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
