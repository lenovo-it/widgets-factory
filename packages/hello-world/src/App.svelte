<svelte:options
  customElement={{
    tag: 'hello-world',
  }}
/>

<script lang="ts">
  import { onMount } from 'svelte';
  import { setupDarkModeManagerMisc, useDarkModeManagerMisc, registerStyles } from '@lenovo-it/widgets-shared/svelte';

  // You can remove this one.
  // If you don't want to use `tailwindcss` functionality.
  import styles from './tailwind.css';

  // Add this into the root component if your biz feature needed, only once.
  setupDarkModeManagerMisc();

  // Use, can be used in any child component under this root component.
  const darkModeManagerMisc = useDarkModeManagerMisc();

  // Props.
  export let count = 0;

  function handleCountIncrease() {
    count++;
  }

  onMount(function () {
    console.log('Hello world!');
  });
</script>

<div class="hello-world text-center" use:registerStyles={{ styles }}>
  <p class="bg-amber-100 mb-1.5">{count}</p>
  <button class="button rounded border-2 p-1 bg-blue-200" on:click={handleCountIncrease}>Hello</button>
</div>

<style lang="scss">
  @import '@lenovo-it/widgets-shared/sass';

  $red-color: red;

  p {
    color: $red-color;
  }
</style>
