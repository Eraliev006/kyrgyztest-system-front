<template>
  <div class="question">
    <p class="content">{{ question.content }}</p>
    <div class="options">
      <label v-for="opt in question.answerOptions" :key="opt.id" class="option">
        <input type="radio" :value="opt.id" v-model="selected" />
        {{ opt.content }}
      </label>
    </div>
    <button @click="handleNext" :disabled="!selected">
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
const selected = ref('')

async function handleNext() {
  if (!selected.value) return
  await store.saveAnswer(props.question.id, selected.value)
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
  gap: 20px;
}
.content {
  font-size: 18px;
  line-height: 1.6;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 16px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: background 0.15s;
}
.option:hover {
  background: #f0f7ff;
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
button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
