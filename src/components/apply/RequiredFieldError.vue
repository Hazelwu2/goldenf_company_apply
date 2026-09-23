<script setup lang="ts">
import FieldError from './FieldError.vue'

defineProps<{ id: string }>()
</script>

<template>
  <FieldError :id="id" zh="此栏位必填" en="This field is required" />
</template>
