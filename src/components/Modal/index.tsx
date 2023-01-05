import styles from './styles.module.scss';

type Props = {
  children: React.ReactNode;
  danger?: boolean;
};

export function Modal({ children, danger }: Props) {
  return (
    <div className={styles.modal}>
      <div className={`${styles.container} ${danger ? styles.danger : ''}`}>
        {children}
      </div>
    </div>
  );
}
