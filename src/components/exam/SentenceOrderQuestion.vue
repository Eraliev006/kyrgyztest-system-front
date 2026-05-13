<template>
  <div class="question">
    <p class="content">Расставьте предложения в правильном порядке:</p>
    <p class="hint">Перетащите предложения для изменения порядка</p>
    <div class="sentence-list">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="sentence"
        draggable="true"
        :class="{ dragging: draggedIndex === index }"
        @dragstart="draggedIndex = index"
        @dragover.prevent
        @drop="onDrop(index)"
        @dragend="draggedIndex = null"
      >
        <span class="num">{{ index + 1 }}</span>
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
.sentence-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sentence {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  font-size: 16px;
  line-height: 1.5;
}
.sentence.dragging {
  opacity: 0.4;
}
.num {
  font-weight: bold;
  color: #2563eb;
  min-width: 20px;
  flex-shrink: 0;
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
