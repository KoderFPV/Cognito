import styles from './CmsHeaderTemplate.module.scss';

export interface ICmsHeaderTemplateProps {
  storeName: string;
}

export const CmsHeaderTemplate = ({ storeName }: ICmsHeaderTemplateProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.storeName}>{storeName}</h1>
      </div>
    </header>
  );
};
