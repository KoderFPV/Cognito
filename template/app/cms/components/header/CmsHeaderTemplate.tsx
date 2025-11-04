import { RefObject } from 'react';
import styles from './CmsHeaderTemplate.module.scss';

export interface ICmsHeaderTemplateProps {
  storeName: string;
  userEmail?: string | null;
  userInitial: string;
  isDropdownOpen: boolean;
  onAvatarClick: () => void;
  onLogout: () => void;
  dropdownRef: RefObject<HTMLDivElement | null>;
  logoutText: string;
}

export const CmsHeaderTemplate = ({
  storeName,
  userEmail,
  userInitial,
  isDropdownOpen,
  onAvatarClick,
  onLogout,
  dropdownRef,
  logoutText,
}: ICmsHeaderTemplateProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.storeName}>{storeName}</h1>
        {userEmail && (
          <div className={styles.userSection} ref={dropdownRef}>
            <button
              className={styles.avatar}
              title={userEmail}
              onClick={onAvatarClick}
              type="button"
            >
              {userInitial}
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <span className={styles.userEmail}>{userEmail}</span>
                </div>
                <button
                  className={styles.logoutButton}
                  onClick={onLogout}
                  type="button"
                >
                  {logoutText}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
