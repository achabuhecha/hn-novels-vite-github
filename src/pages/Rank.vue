<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const novels = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const categories = ref([])

// 筛选条件
const filters = reactive({
  categoryId: 'all',
  status: 'all',
  wordCount: 'all',
  updateTime: 'all',
  chapterCount: 'all',
  score: 'all'
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

const scoreOptions = [
  { value: 'all', label: '全部' },
  { value: '9+', label: '9分以上', min: 9, max: null },
  { value: '8-9', label: '8-9分', min: 8, max: 9 },
  { value: '7-8', label: '7-8分', min: 7, max: 8 },
  { value: '6-7', label: '6-7分', min: 6, max: 7 },
  { value: '5-6', label: '5-6分', min: 5, max: 6 },
  { value: '0-5', label: '5分以下', min: 0, max: 5 }
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
  
  if (filters.categoryId !== 'all') params.categoryId = filters.categoryId
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
  
  // 评分筛选
  const scoreOpt = scoreOptions.find(o => o.value === filters.score)
  if (scoreOpt && scoreOpt.min !== undefined) {
    params.scoreMin = scoreOpt.min
    if (scoreOpt.max) params.scoreMax = scoreOpt.max
  }
  
  return params
}

const fetchRanking = async () => {
  loading.value = true
  try {
    const res = await api.get('/books/ranking', { params: getFilterParams() })
    novels.value = res.books || []
    total.value = res.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const setFilter = (key, value) => {
  filters[key] = value
  currentPage.value = 1
  fetchRanking()
}

const handlePageChange = (page) => {
  currentPage.value = page
  router.push({
    path: route.path,
    query: { ...route.query, page: page > 1 ? page : undefined }
  })
  fetchRanking()
  window.scrollTo({ top: 0 })
}

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

watch(
  () => route.query.page,
  (page) => {
    currentPage.value = Number(page) || 1
    fetchRanking()
  }
)

onMounted(() => {
  currentPage.value = Number(route.query.page) || 1
  fetchCategories()
  fetchRanking()
})
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="section-header">
      <span>🏆 排行榜</span>
    </div>
    
    <!-- 分类筛选 -->
    <div class="filter-row">
      <span class="filter-label">分类：</span>
      <a 
        href="#"
        @click.prevent="setFilter('categoryId', 'all')"
        :class="{ active: filters.categoryId === 'all' }"
      >全部</a>
      <a 
        v-for="cat in categories" 
        :key="cat.id"
        href="#"
        @click.prevent="setFilter('categoryId', cat.id)"
        :class="{ active: filters.categoryId === cat.id }"
      >{{ cat.name }}</a>
    </div>
    
    <!-- 状态筛选 -->
    <div class="filter-row">
      <span class="filter-label">状态：</span>
      <a 
        v-for="opt in statusOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="setFilter('status', opt.value)"
        :class="{ active: filters.status === opt.value }"
      >{{ opt.label }}</a>
    </div>
    
    <!-- 字数筛选 -->
    <div class="filter-row">
      <span class="filter-label">字数：</span>
      <a 
        v-for="opt in wordCountOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="setFilter('wordCount', opt.value)"
        :class="{ active: filters.wordCount === opt.value }"
      >{{ opt.label }}</a>
    </div>
    
    <!-- 更新时间筛选 -->
    <div class="filter-row">
      <span class="filter-label">更新：</span>
      <a 
        v-for="opt in updateTimeOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="setFilter('updateTime', opt.value)"
        :class="{ active: filters.updateTime === opt.value }"
      >{{ opt.label }}</a>
    </div>
    
    <!-- 章节数筛选 -->
    <div class="filter-row">
      <span class="filter-label">章节：</span>
      <a 
        v-for="opt in chapterCountOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="setFilter('chapterCount', opt.value)"
        :class="{ active: filters.chapterCount === opt.value }"
      >{{ opt.label }}</a>
    </div>
    
    <!-- 评分筛选 -->
    <div class="filter-row" style="border-bottom: 1px solid #e5e7eb;">
      <span class="filter-label">评分：</span>
      <a 
        v-for="opt in scoreOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="setFilter('score', opt.value)"
        :class="{ active: filters.score === opt.value }"
      >{{ opt.label }}</a>
    </div>

    <!-- 结果统计 -->
    <div style="padding: 10px 12px; font-size: 12px; color: #6b7280;">
      共 {{ total }} 本
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 排行列表 -->
    <ul v-else class="book-list">
      <li v-for="(novel, index) in novels" :key="novel.id" class="book-item">
        <span style="width: 24px; text-align: center; font-weight: bold;" :style="{ color: index < 3 ? '#dc2626' : '#6b7280' }">
          {{ index + 1 + (currentPage - 1) * pageSize }}
        </span>
        <span class="book-category">[{{ novel.category?.name || '其他' }}]</span>
        <router-link :to="`/book/${novel.id}`" class="book-title">{{ novel.title }}</router-link>
        <span class="book-author">{{ novel.author }}</span>
      </li>
    </ul>

    <!-- 空状态 -->
    <div v-if="!loading && novels.length === 0" class="empty">暂无数据</div>

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
