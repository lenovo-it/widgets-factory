export * from './App.svelte';

// Dev.
if (__DEV__) {
  // Normal use.
  // import('./App.svelte').then(App => {
  //   new App.default({
  //     target: document.getElementById('root')!,
  //     props: {
  //       count: 5,
  //     },
  //   });
  // });

  // CustomElements use.
  const targetElement = document.createElement('$NAME$') as any;
  targetElement.count = 5;
  document.getElementById('root')!.appendChild(targetElement);
}
