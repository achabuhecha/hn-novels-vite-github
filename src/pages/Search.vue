<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const query = ref('')
const loading = ref(false)
const novels = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const doSearch = async () => {
  if (!query.value.trim()) return
  
  loading.value = true
  try {
    const res = await api.get('/books/search', {
      params: {
        q: query.value,
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    novels.value = res.books || []
    total.value = res.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  router.push({ path: '/search', query: { q: query.value } })
  doSearch()
}

const handlePageChange = (page) => {
  currentPage.value = page
  doSearch()
  window.scrollTo({ top: 0 })
}

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

watch(() => route.query.q, (newQ) => {
  if (newQ) {
    query.value = newQ
    doSearch()
  }
}, { immediate: true })

onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q
    doSearch()
  }
})
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        v-model="query" 
        type="text" 
        placeholder="搜索小说/作者" 
        @keyup.enter="handleSearch"
      >
      <button @click="handleSearch">搜索</button>
    </div>

    <!-- 搜索结果 -->
    <div v-if="query" class="section-header">
      <span>搜索结果</span>
      <span style="font-weight: normal; font-size: 12px;">共 {{ total }} 本</span>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading">搜索中...</div>

    <!-- 结果列表 -->
    <ul v-else-if="novels.length > 0" class="book-list">
      <li v-for="novel in novels" :key="novel.id" class="book-item">
        <span class="book-category">[{{ novel.category?.name || '其他' }}]</span>
        <router-link :to="`/book/${novel.id}`" class="book-title">{{ novel.title }}</router-link>
        <span class="book-author">{{ novel.author }}</span>
      </li>
    </ul>

    <!-- 空状态 -->
    <div v-else-if="query && !loading" class="empty">未找到相关小说</div>

    <!-- 分页 -->
    <div v-if="novels.length > 0" class="pagination">
      <a v-if="currentPage > 1" href="#" @click.prevent="handlePageChange(currentPage - 1)">上一页</a>
      <span class="active">{{ currentPage }} / {{ totalPages }}</span>
      <a v-if="currentPage < totalPages" href="#" @click.prevent="handlePageChange(currentPage + 1)">下一页</a>
    </div>
  </div>
</template>
