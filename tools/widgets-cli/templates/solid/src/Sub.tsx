import styles from './index.scss';
import { useStyles, useDarkModeManagerMisc } from '@lenovo-it/widgets-shared/src/solid';

const Sub = () => {
  useStyles(styles);

  // If you didn't want to use `darkModeManager` feature,
  // then you have to remove the code below, 'cause it significantly increases the bundled file size.
  const darkModeManagerMisc = useDarkModeManagerMisc();

  return (
    <>
      <p>Hello Test</p>
      <p>{darkModeManagerMisc.currentModeState.darkModeEnabled + ''}</p>
      <p>
        {darkModeManagerMisc.computed(function (f) {
          return f.darkModeEnabled;
        }) + ''}
      </p>
    </>
  );
};

export default Sub;
