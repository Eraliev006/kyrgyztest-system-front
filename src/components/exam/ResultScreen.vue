<template>
  <div class="result-wrapper">
    <div class="result-card">
      <h2>Результат теста</h2>
      <div class="level">{{ result.level }}</div>
      <div class="scores">
        <div class="score-row">
          <span>Грамматика</span>
          <span>{{ result.grammarScore }}</span>
        </div>
        <div class="score-row">
          <span>Аудирование</span>
          <span>{{ result.listeningScore }}</span>
        </div>
        <div class="score-row">
          <span>Чтение</span>
          <span>{{ result.readingScore }}</span>
        </div>
        <div class="score-row">
          <span>Письмо</span>
          <span>{{ result.writingScore }}</span>
        </div>
        <div class="score-row total">
          <span>Итого</span>
          <span>{{ result.totalScore }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SubmitResult } from '../../types'

defineProps<{ result: SubmitResult }>()
</script>

<style scoped>
.result-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f4fd;
}
.result-card {
  background: white;
  padding: 48px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 420px;
  text-align: center;
}
h2 {
  margin-bottom: 12px;
  font-size: 22px;
}
.level {
  font-size: 52px;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 32px;
}
.scores {
  display: flex;
  flex-direction: column;
  gap: 0;
  text-align: left;
}
.score-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 16px;
}
.score-row.total {
  font-weight: bold;
  font-size: 18px;
  border-bottom: none;
  margin-top: 4px;
}
</style>
