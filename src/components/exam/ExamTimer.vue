<template>
  <div class="timer" :class="{ warning: remaining <= 60 }">
    {{ formatted }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ seconds: number }>()
const emit = defineEmits<{ expired: [] }>()

const remaining = ref(props.seconds)
let interval: ReturnType<typeof setInterval>

const formatted = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

onMounted(() => {
  if (remaining.value <= 0) return
  interval = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      clearInterval(interval)
      emit('expired')
    }
  }, 1000)
})

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.timer {
  font-size: 28px;
  font-weight: bold;
  color: #2563eb;
  font-variant-numeric: tabular-nums;
}
.timer.warning {
  color: #dc2626;
}
</style>
