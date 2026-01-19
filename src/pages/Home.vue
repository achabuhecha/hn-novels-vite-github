<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const hotNovels = ref([])
const newNovels = ref([])
const loading = ref(true)

const fetchData = async () => {
  try {
    const [hotRes, newRes] = await Promise.all([
      api.get('/books/hot'),
      api.get('/books/new')
    ])
    hotNovels.value = hotRes || []
    newNovels.value = newRes || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input type="text" placeholder="搜索小说/作者" @keyup.enter="$router.push('/search?q=' + $event.target.value)">
      <button @click="$router.push('/search')">搜索</button>
    </div>
    
    <!-- 热门推荐 -->
    <div class="section-header">
      <span>🔥 热门推荐</span>
      <router-link to="/rank">更多...</router-link>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <ul v-else class="book-list">
      <li v-for="book in hotNovels.slice(0, 10)" :key="book.id" class="book-item">
        <span class="book-category">[{{ book.category?.name || '其他' }}]</span>
        <router-link :to="`/book/${book.id}`" class="book-title">{{ book.title }}</router-link>
        <span class="book-author">{{ book.author }}</span>
      </li>
    </ul>
    
    <!-- 最近更新 -->
    <div class="section-header">
      <span>📖 最近更新</span>
      <router-link to="/category/all">更多...</router-link>
    </div>
    
    <ul v-if="!loading" class="book-list">
      <li v-for="book in newNovels.slice(0, 10)" :key="book.id" class="book-item">
        <span class="book-category">[{{ book.category?.name || '其他' }}]</span>
        <router-link :to="`/book/${book.id}`" class="book-title">{{ book.title }}</router-link>
        <span class="book-author">{{ book.author }}</span>
      </li>
    </ul>
    
    <div v-if="!loading && newNovels.length === 0" class="empty">暂无数据</div>
  </div>
</template>
