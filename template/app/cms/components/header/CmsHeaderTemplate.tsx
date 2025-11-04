import styles from './CmsHeaderTemplate.module.scss';

export interface ICmsHeaderTemplateProps {
  storeName: string;
  userEmail?: string | null;
  userInitial: string;
}

export const CmsHeaderTemplate = ({
  storeName,
  userEmail,
  userInitial,
}: ICmsHeaderTemplateProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.storeName}>{storeName}</h1>
        {userEmail && (
          <div className={styles.userSection}>
            <div className={styles.avatar} title={userEmail}>
              {userInitial}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
