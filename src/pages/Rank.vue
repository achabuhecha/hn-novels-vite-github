<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api'

const loading = ref(true)
const novels = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const filters = reactive({
  categoryId: 'all',
  status: 'all'
})

const categories = ref([])

const statusOptions = [
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

const fetchRanking = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      categoryId: filters.categoryId !== 'all' ? filters.categoryId : undefined,
      status: filters.status !== 'all' ? filters.status : undefined
    }
    const res = await api.get('/books/ranking', { params })
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
  fetchRanking()
  window.scrollTo({ top: 0 })
}

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

onMounted(() => {
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
    <div style="padding: 10px 12px; display: flex; flex-wrap: wrap; gap: 8px;">
      <span style="color: #6b7280; font-size: 12px;">分类：</span>
      <a 
        href="#"
        @click.prevent="setFilter('categoryId', 'all')"
        :style="{ fontWeight: filters.categoryId === 'all' ? 'bold' : 'normal' }"
      >全部</a>
      <a 
        v-for="cat in categories" 
        :key="cat.id"
        href="#"
        @click.prevent="setFilter('categoryId', cat.id)"
        :style="{ fontWeight: filters.categoryId === cat.id ? 'bold' : 'normal' }"
      >{{ cat.name }}</a>
    </div>
    
    <!-- 状态筛选 -->
    <div style="padding: 0 12px 10px; display: flex; gap: 12px; border-bottom: 1px solid #e5e7eb;">
      <span style="color: #6b7280; font-size: 12px;">状态：</span>
      <a 
        v-for="opt in statusOptions" 
        :key="opt.value"
        href="#"
        @click.prevent="setFilter('status', opt.value)"
        :style="{ fontWeight: filters.status === opt.value ? 'bold' : 'normal' }"
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
