import styles from './storybook-shelf.module.css';

/* eslint-disable-next-line */
export interface StorybookShelfProps {}

export function StorybookShelf(props: StorybookShelfProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to StorybookShelf!</h1>
    </div>
  );
}

export default StorybookShelf;
