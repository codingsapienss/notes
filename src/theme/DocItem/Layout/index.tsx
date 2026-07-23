/**
 * Custom DocItem/Layout — adds collapse/expand toggle for the right TOC sidebar.
 * Desktop only (>= 997px). Mobile behavior is untouched.
 * Icons match the left sidebar's convention:
 *   - Expanded  → ChevronRight (points to edge, "hide this sidebar")
 *   - Collapsed → ChevronLeft  (points to content, "show this sidebar")
 */

import React, {type ReactNode, useState, useEffect, useCallback} from 'react';
import clsx from 'clsx';
import {useWindowSize} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import ContentVisibility from '@theme/ContentVisibility';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import type {Props} from '@theme/DocItem/Layout';

import styles from './styles.module.css';

function useDocTOC() {
  const {frontMatter, toc} = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;

  const desktop =
    canRender && (windowSize === 'desktop' || windowSize === 'ssr') ? (
      <DocItemTOCDesktop />
    ) : undefined;

  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout({children}: Props): ReactNode {
  const docTOC = useDocTOC();
  const {metadata} = useDoc();
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);

  // Persist TOC state across page navigations
  useEffect(() => {
    const saved = localStorage.getItem('docusaurus-toc-collapsed');
    if (saved !== null) {
      setIsTocCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('docusaurus-toc-collapsed', String(isTocCollapsed));
  }, [isTocCollapsed]);

  const toggleToc = useCallback(() => {
    setIsTocCollapsed((prev) => !prev);
  }, []);

  return (
    <div className={clsx('row', isTocCollapsed && styles.tocCollapsed)}>
      <div className={clsx('col', !docTOC.hidden && styles.docItemCol)}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      {docTOC.desktop && (
        <div className={clsx('col', 'col--3', styles.tocColumn)}>
          {isTocCollapsed ? (
            <button
              type="button"
              className={styles.tocExpandButton}
              onClick={toggleToc}
              aria-label="Expand table of contents"
              title="Expand table of contents">
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div className={styles.tocInner}>
              <button
                type="button"
                className={styles.tocCollapseButton}
                onClick={toggleToc}
                aria-label="Collapse table of contents"
                title="Collapse table of contents">
                <ChevronRight size={18} />
              </button>
              {docTOC.desktop}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
