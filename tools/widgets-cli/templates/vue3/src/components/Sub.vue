<template>
  <div>Sub</div>
</template>

<script setup lang="ts">
import { useDarkModeManagerMisc } from '@lenovo-it/widgets-shared/vue3';

// Use, can be used in any child component under this root component.
const darkModeManagerMisc = useDarkModeManagerMisc()!;

darkModeManagerMisc.changeEventSubscribe(console.log, { immediate: true });
</script>

<style lang="scss"></style>
