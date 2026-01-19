<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const historyList = ref([])

const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return date.toLocaleDateString()
}

const loadHistory = () => {
  try {
    const history = JSON.parse(localStorage.getItem('hn_reading_history') || '{}')
    historyList.value = Object.keys(history)
      .map(key => {
        const entry = history[key]
        if (typeof entry === 'string') return null
        return {
          bookId: key,
          ...entry
        }
      })
      .filter(item => item !== null)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  } catch (e) {
    console.error('Failed to load history', e)
  }
}

const resumeReading = (item) => {
  router.push(`/read/${item.bookId}/${item.chapterId}`)
}

const clearHistory = () => {
  if (confirm('确定要清空所有阅读记录吗？')) {
    localStorage.removeItem('hn_reading_history')
    historyList.value = []
  }
}

const removeItem = (bookId) => {
  const history = JSON.parse(localStorage.getItem('hn_reading_history') || '{}')
  delete history[bookId]
  localStorage.setItem('hn_reading_history', JSON.stringify(history))
  loadHistory()
}

onMounted(loadHistory)
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="section-header">
      <span>📖 阅读记录</span>
      <a v-if="historyList.length > 0" href="#" @click.prevent="clearHistory" style="color: #dc2626;">清空</a>
    </div>

    <!-- 空状态 -->
    <div v-if="historyList.length === 0" class="empty">
      暂无阅读记录
      <br>
      <router-link to="/" style="margin-top: 12px; display: inline-block;">去首页看看</router-link>
    </div>

    <!-- 记录列表 -->
    <ul v-else class="book-list">
      <li v-for="item in historyList" :key="item.bookId" class="book-item" style="cursor: pointer;" @click="resumeReading(item)">
        <div style="flex: 1; min-width: 0;">
          <div style="color: #2563eb; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ item.bookTitle || '未知书名' }}
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
            读到：{{ item.chapterTitle || '未知章节' }}
          </div>
        </div>
        <span style="font-size: 12px; color: #9ca3af; flex-shrink: 0;">{{ formatDate(item.updatedAt) }}</span>
        <a href="#" @click.stop.prevent="removeItem(item.bookId)" style="color: #dc2626; margin-left: 8px; font-size: 12px;">删除</a>
      </li>
    </ul>
  </div>
</template>
