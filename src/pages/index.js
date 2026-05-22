import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const KnowledgeCategories = [
  {
    title: 'Data Structures & Algorithms',
    description: 'Master DSA with C++ STL, complexity analysis, and problem-solving techniques.',
    link: '/docs/DSA/STL/part-01_foundation',
    icon: '📊',
  },
  {
    title: 'TypeScript',
    description: 'Deep dive into type systems, decorators, and scalable JS applications.',
    link: '/docs/WebDev/TypeScript/intro',
    icon: '🟦',
  },
  {
    title: 'React',
    description: 'Build modern UIs with hooks, state management, and component patterns.',
    link: '/docs/WebDev/React/intro',
    icon: '⚛️',
  },
  {
    title: 'Coming Soon...',
    description: 'System Design, Backend Engineering, and more notes on the way.',
    link: '#',
    icon: '🚀',
  },
];

function CategoryCard({title, description, link, icon}) {
  return (
    <div className="col col--6 margin-bottom--lg">
      <Link className="card" to={link} style={{textDecoration: 'none'}}>
        <div className="card__header">
          <Heading as="h3">
            <span style={{marginRight: '10px'}}>{icon}</span>
            {title}
          </Heading>
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
        <p className="hero__subtitle">Your Personal Knowledge Hub for Software Engineering</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/DSA/STL/part-01_foundation">
            Explore My Notes 📚
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
      description="Personal knowledge base for DSA, Web Development, and more.">
      <HomepageHeader />
      <main>
        <div className="container" style={{padding: '4rem 0'}}>
          <div className="row">
            {KnowledgeCategories.map((props, idx) => (
              <CategoryCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
