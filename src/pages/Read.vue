<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const bookId = computed(() => route.params.bookId)
const chapterId = computed(() => route.params.chapterId)

const chapter = ref(null)
const loading = ref(true)

const paragraphs = computed(() => {
  if (!chapter.value?.content) return []
  return chapter.value.content.split('\n').filter((text) => text.trim())
})

const fetchChapter = async () => {
  loading.value = true
  window.scrollTo(0, 0)
  try {
    const res = await api.get(`/books/${bookId.value}/chapters/${chapterId.value}`)
    chapter.value = res
    saveProgress(res)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const saveProgress = (chapterData) => {
  try {
    const history = JSON.parse(localStorage.getItem('hn_reading_history') || '{}')
    history[bookId.value] = {
      chapterId: chapterId.value,
      chapterTitle: chapterData.title,
      bookTitle: chapterData.bookTitle,
      updatedAt: Date.now()
    }
    localStorage.setItem('hn_reading_history', JSON.stringify(history))
  } catch (e) {
    console.error(e)
  }
}

const prevChapter = () => {
  if (chapter.value?.prevChapterId) {
    router.push(`/read/${bookId.value}/${chapter.value.prevChapterId}`)
  }
}

const nextChapter = () => {
  if (chapter.value?.nextChapterId) {
    router.push(`/read/${bookId.value}/${chapter.value.nextChapterId}`)
  }
}

const handleKey = (e) => {
  if (e.key === 'ArrowLeft') prevChapter()
  if (e.key === 'ArrowRight') nextChapter()
}

watch([bookId, chapterId], fetchChapter)

onMounted(() => {
  fetchChapter()
  window.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
})
</script>

<template>
  <div style="background: #f5f5dc; min-height: 100vh; padding-bottom: 60px;">
    <!-- 顶部导航 -->
    <div style="padding: 10px 12px; background: #f5f5dc; border-bottom: 1px solid #e0e0d0; display: flex; justify-content: space-between; align-items: center;">
      <router-link :to="`/book/${bookId}`" style="font-size: 14px;">← 返回目录</router-link>
      <span v-if="chapter" style="font-size: 14px; font-weight: 500; max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        {{ chapter.title }}
      </span>
      <div style="display: flex; gap: 16px;">
        <a href="#" @click.prevent="prevChapter" :style="{ opacity: chapter?.prevChapterId ? 1 : 0.3 }">上一章</a>
        <a href="#" @click.prevent="nextChapter" :style="{ opacity: chapter?.nextChapterId ? 1 : 0.3 }">下一章</a>
      </div>
    </div>

    <!-- 内容 -->
    <div style="max-width: 800px; margin: 0 auto; padding: 24px 16px;">
      <div v-if="loading" class="loading">加载中...</div>

      <article v-else>
        <h2 style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 24px;">{{ chapter.title }}</h2>
        <div style="font-size: 16px; line-height: 2; color: #333;">
          <p v-for="(p, i) in paragraphs" :key="i" style="text-indent: 2em; margin-bottom: 16px;">{{ p }}</p>
        </div>
      </article>
      
      <!-- 底部导航 -->
      <div v-if="chapter" style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e0e0d0;">
        <a 
          href="#" 
          @click.prevent="prevChapter" 
          :style="{ opacity: chapter?.prevChapterId ? 1 : 0.3, padding: '8px 16px', border: '1px solid #ccc' }"
        >上一章</a>
        
        <router-link :to="`/book/${bookId}`">目录</router-link>

        <a 
          href="#" 
          @click.prevent="nextChapter" 
          :style="{ opacity: chapter?.nextChapterId ? 1 : 0.3, padding: '8px 16px', background: '#1e3a8a', color: 'white' }"
        >下一章</a>
      </div>
    </div>
  </div>
</template>
