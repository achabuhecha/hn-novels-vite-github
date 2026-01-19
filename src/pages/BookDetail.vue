<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id

const book = ref(null)
const loading = ref(true)
const isReversed = ref(false)

const fetchBook = async () => {
  try {
    const res = await api.get(`/books/${bookId}`)
    book.value = res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const toggleOrder = () => {
  if (book.value) {
    book.value.chapters = book.value.chapters.reverse()
    isReversed.value = !isReversed.value
  }
}

const startReading = () => {
  if (book.value && book.value.chapters.length > 0) {
    router.push(`/read/${bookId}/${book.value.chapters[0].id}`)
  }
}

const formatWordCount = (count) => {
  if (!count) return '0字'
  if (count >= 10000) return (count / 10000).toFixed(1) + '万字'
  return count + '字'
}

onMounted(fetchBook)
</script>

<template>
  <div>
    <!-- 加载中 -->
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="book">
      <!-- 书籍信息 -->
      <div class="section-header">
        <span>书籍详情</span>
      </div>
      
      <div style="padding: 12px;">
        <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">{{ book.title }}</h1>
        
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">
          <span>作者：{{ book.author }}</span>
          <span style="margin: 0 8px;">|</span>
          <span>分类：{{ book.category?.name || book.category }}</span>
          <span style="margin: 0 8px;">|</span>
          <span>字数：{{ formatWordCount(book.wordCount) }}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <a 
            href="#" 
            @click.prevent="startReading"
            style="display: inline-block; padding: 8px 24px; background: #1e3a8a; color: white; margin-right: 12px;"
          >开始阅读</a>
        </div>
        
        <div style="font-size: 13px; color: #374151; line-height: 1.8; padding: 12px; background: #f9fafb;">
          {{ book.description || '暂无简介' }}
        </div>
      </div>

      <!-- 章节列表 -->
      <div class="section-header">
        <span>章节目录 ({{ book.chapters?.length || 0 }}章)</span>
        <a href="#" @click.prevent="toggleOrder">{{ isReversed ? '正序' : '倒序' }}</a>
      </div>
      
      <ul class="book-list">
        <li v-for="chapter in book.chapters" :key="chapter.id" class="book-item">
          <router-link 
            :to="`/read/${book.id}/${chapter.id}`" 
            class="book-title"
            style="flex: 1;"
          >{{ chapter.title }}</router-link>
        </li>
      </ul>
    </div>

    <!-- 不存在 -->
    <div v-else class="empty">书籍不存在</div>
  </div>
</template>
