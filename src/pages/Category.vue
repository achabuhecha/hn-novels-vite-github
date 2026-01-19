<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const activeCategory = ref(0)
const activeStatus = ref('all')
const loading = ref(true)
const novels = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const categories = ref([])

const allCategories = computed(() => {
  return [{ id: 0, name: '全部' }, ...categories.value]
})

const statuses = [
  { value: 'all', label: '全部' },
  { value: 'serializing', label: '连载' },
  { value: 'completed', label: '完结' }
]

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories')
    categories.value = res || []
  } catch (e) {
    console.error(e)
  }
}

const fetchBooks = async () => {
  loading.value = true
  try {
    const categoryId = activeCategory.value === 0 ? 'all' : activeCategory.value
    const res = await api.get(`/books/category/${categoryId}`, {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        status: activeStatus.value
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

const handleCategoryChange = (id) => {
  activeCategory.value = id
  currentPage.value = 1
  router.push(`/category/${id === 0 ? 'all' : id}`)
  fetchBooks()
}

const handleStatusChange = (status) => {
  activeStatus.value = status
  currentPage.value = 1
  fetchBooks()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchBooks()
  window.scrollTo({ top: 0 })
}

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

watch(() => route.params.id, (newId) => {
  activeCategory.value = newId === 'all' ? 0 : Number(newId) || 0
  fetchBooks()
}, { immediate: true })

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <!-- 分类筛选 -->
    <div class="section-header">
      <span>分类</span>
    </div>
    <div style="padding: 10px 12px; display: flex; flex-wrap: wrap; gap: 8px;">
      <a 
        v-for="cat in allCategories" 
        :key="cat.id"
        href="#"
        @click.prevent="handleCategoryChange(cat.id)"
        :style="{ fontWeight: activeCategory === cat.id ? 'bold' : 'normal' }"
      >{{ cat.name }}</a>
    </div>
    
    <!-- 状态筛选 -->
    <div style="padding: 0 12px 10px; display: flex; gap: 12px; border-bottom: 1px solid #e5e7eb;">
      <a 
        v-for="status in statuses" 
        :key="status.value"
        href="#"
        @click.prevent="handleStatusChange(status.value)"
        :style="{ fontWeight: activeStatus === status.value ? 'bold' : 'normal' }"
      >{{ status.label }}</a>
    </div>

    <!-- 结果统计 -->
    <div style="padding: 10px 12px; font-size: 12px; color: #6b7280;">
      共 {{ total }} 本
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 书籍列表 -->
    <ul v-else class="book-list">
      <li v-for="novel in novels" :key="novel.id" class="book-item">
        <span class="book-category">[{{ novel.category?.name || '其他' }}]</span>
        <router-link :to="`/book/${novel.id}`" class="book-title">{{ novel.title }}</router-link>
        <span class="book-author">{{ novel.author }}</span>
      </li>
    </ul>

    <!-- 空状态 -->
    <div v-if="!loading && novels.length === 0" class="empty">暂无相关书籍</div>

    <!-- 分页 -->
    <div v-if="novels.length > 0" class="pagination">
      <a v-if="currentPage > 1" href="#" @click.prevent="handlePageChange(currentPage - 1)">上一页</a>
      <span class="active">{{ currentPage }} / {{ totalPages }}</span>
      <a v-if="currentPage < totalPages" href="#" @click.prevent="handlePageChange(currentPage + 1)">下一页</a>
    </div>
  </div>
</template>
