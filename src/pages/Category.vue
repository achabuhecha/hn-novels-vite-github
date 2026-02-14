<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const activeCategory = ref(0)
const loading = ref(true)
const novels = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const categories = ref([])

// 筛选条件
const filters = reactive({
  status: 'all',
  wordCount: 'all',
  updateTime: 'all',
  chapterCount: 'all'
})

const allCategories = computed(() => {
  return [{ id: 0, name: '全部' }, ...categories.value]
})

// 筛选选项
const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'serializing', label: '连载' },
  { value: 'completed', label: '完结' }
]

const wordCountOptions = [
  { value: 'all', label: '全部' },
  { value: '0-30', label: '30万以下', min: 0, max: 300000 },
  { value: '30-50', label: '30-50万', min: 300000, max: 500000 },
  { value: '50-100', label: '50-100万', min: 500000, max: 1000000 },
  { value: '100+', label: '100万以上', min: 1000000, max: null }
]

const updateTimeOptions = [
  { value: 'all', label: '全部' },
  { value: '7days', label: '7天内' },
  { value: '30days', label: '30天内' },
  { value: '90days', label: '90天内' }
]

const chapterCountOptions = [
  { value: 'all', label: '全部' },
  { value: '0-100', label: '100章以下', min: 0, max: 100 },
  { value: '100-500', label: '100-500章', min: 100, max: 500 },
  { value: '500-1000', label: '500-1000章', min: 500, max: 1000 },
  { value: '1000+', label: '1000章以上', min: 1000, max: null }
]

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories')
    categories.value = res || []
  } catch (e) {
    console.error(e)
  }
}

const getFilterParams = () => {
  const params = {
    page: currentPage.value,
    pageSize: pageSize.value
  }
  
  if (filters.status !== 'all') params.status = filters.status
  if (filters.updateTime !== 'all') params.updateTime = filters.updateTime
  
  // 字数范围
  const wordOpt = wordCountOptions.find(o => o.value === filters.wordCount)
  if (wordOpt && wordOpt.min !== undefined) {
    params.wordCountMin = wordOpt.min
    if (wordOpt.max) params.wordCountMax = wordOpt.max
  }
  
  // 章节数范围
  const chapterOpt = chapterCountOptions.find(o => o.value === filters.chapterCount)
  if (chapterOpt && chapterOpt.min !== undefined) {
    params.chapterCountMin = chapterOpt.min
    if (chapterOpt.max) params.chapterCountMax = chapterOpt.max
  }
  
  return params
}

const fetchBooks = async () => {
  loading.value = true
  try {
    const categoryId = activeCategory.value === 0 ? 'all' : activeCategory.value
    const res = await api.get(`/books/category/${categoryId}`, {
      params: getFilterParams()
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

const handleFilterChange = (key, value) => {
  filters[key] = value
  currentPage.value = 1
  fetchBooks()
}

const handlePageChange = (page) => {
  currentPage.value = page
  router.push({
    path: route.path,
    query: { ...route.query, page: page > 1 ? page : undefined }
  })
  fetchBooks()
  window.scrollTo({ top: 0 })
}

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

watch(
  () => ({ id: route.params.id, page: route.query.page }),
  ({ id: newId, page }) => {
    activeCategory.value = newId === 'all' ? 0 : Number(newId) || 0
    currentPage.value = Number(page) || 1
    fetchBooks()
  },
  { immediate: true }
)

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
    
    <!-- 筛选条件 -->
    <div class="filter-row">
      <span class="filter-label">状态：</span>
      <a 
        v-for="opt in statusOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="handleFilterChange('status', opt.value)"
        :class="{ active: filters.status === opt.value }"
      >{{ opt.label }}</a>
    </div>
    
    <div class="filter-row">
      <span class="filter-label">字数：</span>
      <a 
        v-for="opt in wordCountOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="handleFilterChange('wordCount', opt.value)"
        :class="{ active: filters.wordCount === opt.value }"
      >{{ opt.label }}</a>
    </div>
    
    <div class="filter-row">
      <span class="filter-label">更新：</span>
      <a 
        v-for="opt in updateTimeOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="handleFilterChange('updateTime', opt.value)"
        :class="{ active: filters.updateTime === opt.value }"
      >{{ opt.label }}</a>
    </div>
    
    <div class="filter-row" style="border-bottom: 1px solid #e5e7eb;">
      <span class="filter-label">章节：</span>
      <a 
        v-for="opt in chapterCountOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="handleFilterChange('chapterCount', opt.value)"
        :class="{ active: filters.chapterCount === opt.value }"
      >{{ opt.label }}</a>
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

<style scoped>
.filter-row {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.filter-label {
  color: #6b7280;
  font-size: 12px;
  min-width: 40px;
}
.filter-row a {
  font-size: 13px;
  color: #374151;
}
.filter-row a.active {
  font-weight: bold;
  color: #2563eb;
}
</style>
