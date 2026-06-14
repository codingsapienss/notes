import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { 
  Code2, 
  Braces, 
  Atom, 
  GitBranch,
  ChevronRight 
} from 'lucide-react';

import styles from './index.module.css';

const KnowledgeCategories = [
  {
    title: 'Data Structures & Algorithms',
    description: 'Foundational concepts, C++ STL mastery, and algorithmic problem-solving.',
    link: '/docs/dsa',
    icon: <img src="/notes/img/cpp.svg" width="32" height="32" alt="C++ Logo" />,
  },
  {
    title: 'TypeScript',
    description: 'Advanced type systems, best practices, and scalable application design.',
    link: '/docs/web-dev/typescript/typescript-fundamentals/part1',
    icon: <img src="/notes/img/typescript.svg" width="32" height="32" alt="TypeScript Logo" />,
  },
  {
    title: 'React',
    description: 'Modern UI patterns, state management, and efficient component architecture.',
    link: '/docs/web-dev/react/intro',
    icon: <img src="/notes/img/react.svg" width="32" height="32" alt="React Logo" />,
  },
  {
    title: 'System Design',
    description: 'Scaling applications, distributed systems, and architectural patterns.',
    link: '#',
    icon: <GitBranch size={32} color="#f05032" />,
  },
];

function CategoryListItem({title, description, link, icon}) {
  return (
    <div className={styles.categoryItem}>
      <Link to={link} className={styles.categoryLink}>
        <div className={styles.categoryIcon}>{icon}</div>
        <div className={styles.categoryContent}>
          <Heading as="h3" className={styles.categoryTitle}>{title}</Heading>
          <p className={styles.categoryDescription}>{description}</p>
        </div>
        <div className={styles.categoryArrow}>
          <ChevronRight size={24} />
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
        <p className="hero__subtitle">A curated collection of technical insights and engineering handbooks.</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/dsa">
            Start Reading 🚀
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
        <div className="container" style={{padding: '4rem 0', maxWidth: '800px'}}>
          <div className={styles.categoryList}>
            {KnowledgeCategories.map((props, idx) => (
              <CategoryListItem key={idx} {...props} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
