<template>
  <div class="$NAME$">
    <Sub />
    <hr />
    <p>{{ count }}</p>
    <button class="button" @click="() => count++">Click</button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { setupDarkModeManagerMisc, useStyles } from '@lenovo-it/widgets-shared/vue3';
import Sub from './components/Sub.vue';

// You can remove this one.
// If you don't want to use `tailwindcss` functionality.
import styles from './tailwind.css';
useStyles(styles);

// Add this into the root component if your biz feature needed, only once.
const darkModeManagerMisc = setupDarkModeManagerMisc();

// Use, can be used in any child component under this root component.
// const darkModeManagerMisc = useDarkModeManagerMisc();

// darkModeManagerMisc.changeEventSubscribe(console.log, { immediate: true })

let count = ref(1);
</script>

<style lang="scss">
@import '@lenovo-it/widgets-shared/sass';

$red-color: red;

p {
  color: $red-color;
}
</style>
