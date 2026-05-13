<template>
  <div class="question">
    <p class="content">Расставьте слова в правильном порядке:</p>
    <p class="hint">Перетащите слова для изменения порядка</p>
    <div class="word-list">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="word"
        draggable="true"
        :class="{ dragging: draggedIndex === index }"
        @dragstart="draggedIndex = index"
        @dragover.prevent
        @drop="onDrop(index)"
        @dragend="draggedIndex = null"
      >
        {{ item.content }}
      </div>
    </div>
    <button @click="handleNext">
      {{ isLast ? 'Завершить' : 'Далее' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useExamStore } from '../../stores/exam'
import type { ExamQuestion } from '../../types'

const props = defineProps<{ question: ExamQuestion; isLast: boolean }>()
const store = useExamStore()
const items = ref([...props.question.answerOptions])
const draggedIndex = ref<number | null>(null)

function onDrop(index: number) {
  if (draggedIndex.value === null || draggedIndex.value === index) return
  const arr = [...items.value]
  const [removed] = arr.splice(draggedIndex.value, 1)
  arr.splice(index, 0, removed)
  items.value = arr
  draggedIndex.value = null
}

async function handleNext() {
  await store.saveAnswer(props.question.id, undefined, items.value.map(i => i.id))
  if (props.isLast) {
    await store.submit()
  } else {
    store.nextQuestion()
  }
}
</script>

<style scoped>
.question {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.content {
  font-size: 18px;
}
.hint {
  color: #666;
  font-size: 14px;
  margin: 0;
}
.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 60px;
}
.word {
  padding: 8px 16px;
  background: #e8f4fd;
  border: 2px solid #2563eb;
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  font-size: 16px;
}
.word.dragging {
  opacity: 0.4;
}
button {
  align-self: flex-end;
  padding: 10px 28px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
</style>
