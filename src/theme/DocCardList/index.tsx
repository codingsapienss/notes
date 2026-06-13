import React, {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  useCurrentSidebarSiblings,
  filterDocCardListItems,
} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocCardList';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import styles from './styles.module.css';

function DocCardListForCurrentSidebarCategory({className}: Props) {
  const items = useCurrentSidebarSiblings();
  return <DocCardList items={items} className={className} />;
}

interface DocListItemProps {
  item: any;
  level?: number;
}

function DocListItem({item, level = 0}: DocListItemProps) {
  const isCategory = item.type === 'category';
  const hasItems = isCategory && item.items && item.items.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    if (hasItems) {
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div 
      className={clsx(
        styles.listItem, 
        isCategory && styles.categoryItem,
        isExpanded && styles.listItemExpanded
      )} 
      style={{ paddingLeft: `${level * 1.5}rem` }}
    >
      <div className={styles.itemHeader} onClick={hasItems ? toggleExpand : undefined}>
        <Link 
          to={item.href || '#'} 
          className={clsx(styles.itemLink, !hasItems && styles.itemLinkLeaf)}
          onClick={(e) => {
            if (hasItems && !item.href) {
              toggleExpand(e);
            }
          }}
        >
          <div className={styles.itemIcon}>
            {isCategory ? (
              isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
            ) : (
              <FileText size={18} />
            )}
          </div>
          <div className={styles.itemContent}>
            <div className={styles.labelWrapper}>
              {isCategory && <Folder size={18} className={styles.folderIcon} />}
              <span className={styles.itemLabel}>{item.label}</span>
            </div>
            {item.description && !isCategory && (
              <p className={styles.itemDescription}>{item.description}</p>
            )}
          </div>
          {!isCategory && <ChevronRight size={18} className={styles.itemArrow} />}
        </Link>
      </div>
      
      {hasItems && isExpanded && (
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
