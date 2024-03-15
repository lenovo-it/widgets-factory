import { createSignal } from 'solid-js';
import { setupDarkModeManagerMisc, useStyles, DarkModeManagerContext } from '@lenovo-it/widgets-shared/solid';
import Sub from './Sub';

// You can remove this one.
// If you don't want to use `tailwindcss` functionality.
import tailwindCssStyles from './tailwind.css';

const App = (props: any) => {
  // Use tailwind functionality.
  // You can remove this one.
  // If you don't want to use `tailwindcss` functionality.
  useStyles(tailwindCssStyles);

  const style = `.content p {
      margin-bottom: .7rem;
    }`;

  const [count, setCount] = createSignal(0);

  // If you didn't want to use `darkModeManager` feature,
  // then you have to remove the code below, 'cause it significantly increases the bundled file size.
  const darkModeManagerMisc = setupDarkModeManagerMisc();

  return (
    // If you didn't want to use `darkModeManager` feature,
    // then you have to remove the code below, 'cause it significantly increases the bundled file size.
    <DarkModeManagerContext.Provider value={darkModeManagerMisc}>
      <div class="content">
        {/** Inline styles. */}
        <style textContent={style} />
        {count() < 1 ? <Sub /> : null}
        <p>{count()}</p>
        <button
          class="bg-blue hover:bg-blue-900 rounded px-3.5 py-2 transition-all outline-0 shadow"
          onClick={() => setCount(count => count + 1)}
        >
          Click
        </button>
      </div>
    </DarkModeManagerContext.Provider>
  );
};

export default App;
