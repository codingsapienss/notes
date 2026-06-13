import React, {type ComponentProps, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  useCurrentSidebarSiblings,
  filterDocCardListItems,
} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocCardList';
import styles from './styles.module.css';

function DocCardListForCurrentSidebarCategory({className}: Props) {
  const items = useCurrentSidebarSiblings();
  return <DocCardList items={items} className={className} />;
}

interface DocListItemProps {
  item: any; // Using any for simplicity as Docusaurus types can be complex
  level?: number;
}

function DocListItem({item, level = 0}: DocListItemProps) {
  const isCategory = item.type === 'category';
  
  return (
    <div 
      className={clsx(styles.listItem, isCategory && styles.categoryItem)} 
      style={{ paddingLeft: `${level * 1.5}rem` }}
    >
      <Link to={item.href || '#'} className={styles.itemLink}>
        <div className={styles.itemIcon}>
          {isCategory ? '📁' : '📄'}
        </div>
        <div className={styles.itemContent}>
          <span className={styles.itemLabel}>{item.label}</span>
          {item.description && (
            <p className={styles.itemDescription}>{item.description}</p>
          )}
        </div>
        {!isCategory && <div className={styles.itemArrow}>→</div>}
      </Link>
      
      {isCategory && item.items && item.items.length > 0 && (
        <div className={styles.nestedList}>
          {item.items.map((subItem: any, index: number) => (
            <DocListItem key={index} item={subItem} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocCardList(props: Props): ReactNode {
  const {items, className} = props;
  if (!items) {
    return <DocCardListForCurrentSidebarCategory {...props} />;
  }
  const filteredItems = filterDocCardListItems(items);
  return (
    <section className={clsx(styles.listContainer, className)}>
      {filteredItems.map((item, index) => (
        <DocListItem key={index} item={item} />
      ))}
    </section>
  );
}
