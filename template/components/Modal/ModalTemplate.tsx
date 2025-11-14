'use client';

import styles from './ModalTemplate.module.scss';

export interface IModalAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'secondary';
}

export interface IModalTemplateProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  actions: IModalAction[];
  onBackdropClick?: () => void;
}

export const ModalTemplate = ({
  isOpen,
  title,
  children,
  actions,
  onBackdropClick,
}: IModalTemplateProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onBackdropClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.content}>{children}</div>

        <div className={styles.actions}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={`${styles.button} ${styles[`button--${action.variant || 'secondary'}`]}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
