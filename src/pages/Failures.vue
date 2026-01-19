<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const failures = ref([])
const loading = ref(true)
const stats = ref({ total: 0, byStatus: {} })

const filters = ref({
  failureType: '',
  status: ''
})

const fetchStats = async () => {
  try {
    const res = await api.get('/failures/stats')
    stats.value = res.data || { total: 0, byStatus: {} }
  } catch (e) {
    console.error(e)
  }
}

const fetchFailures = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.failureType) params.failureType = filters.value.failureType
    if (filters.value.status) params.status = filters.value.status
    
    const res = await api.get('/failures', { params })
    failures.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const deleteFailure = async (id) => {
  if (!confirm('确定删除这条记录?')) return
  try {
    await api.delete(`/failures/${id}`)
    fetchFailures()
    fetchStats()
  } catch (e) {
    alert('删除失败')
  }
}

const markResolved = async (id) => {
  try {
    await api.put(`/failures/${id}/status`, { status: 'resolved' })
    fetchFailures()
    fetchStats()
  } catch (e) {
    alert('操作失败')
  }
}

const markRetrying = async (id) => {
  try {
    await api.put(`/failures/${id}/status`, { status: 'retrying' })
    fetchFailures()
    fetchStats()
  } catch (e) {
    alert('操作失败')
  }
}

onMounted(() => {
  fetchStats()
  fetchFailures()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <span class="text-red-500">⚠️</span> 失败记录管理
    </h1>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div class="text-gray-500 text-sm">总失败数</div>
        <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div class="text-gray-500 text-sm">待处理</div>
        <div class="text-2xl font-bold text-orange-500">{{ stats.byStatus?.pending || 0 }}</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div class="text-gray-500 text-sm">已解决</div>
        <div class="text-2xl font-bold text-green-500">{{ stats.byStatus?.resolved || 0 }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex gap-4">
      <select v-model="filters.failureType" @change="fetchFailures" class="border rounded px-3 py-1">
        <option value="">全部类型</option>
        <option value="book">书籍</option>
        <option value="chapter">章节</option>
      </select>
      <select v-model="filters.status" @change="fetchFailures" class="border rounded px-3 py-1">
        <option value="">全部状态</option>
        <option value="pending">待处理</option>
        <option value="retrying">重试中</option>
        <option value="failed">失败</option>
        <option value="resolved">已解决</option>
      </select>
      <button @click="fetchFailures" class="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">刷新</button>
    </div>

    <!-- List -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-gray-500 font-medium">
          <tr>
            <th class="px-4 py-3">类型</th>
            <th class="px-4 py-3">书籍/章节</th>
            <th class="px-4 py-3">错误信息</th>
            <th class="px-4 py-3">重试</th>
            <th class="px-4 py-3">状态</th>
            <th class="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="6" class="p-4 text-center text-gray-400">加载中...</td></tr>
          <tr v-else-if="failures.length === 0"><td colspan="6" class="p-8 text-center text-gray-400">无记录</td></tr>
          <tr v-for="item in failures" :key="item.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <span :class="item.failureType === 'book' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-0.5 rounded text-xs">
                {{ item.failureType === 'book' ? '书籍' : '章节' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-gray-900">{{ item.bookTitle }}</div>
              <div v-if="item.chapterTitle" class="text-xs text-gray-500">
                [{{ item.chapterIndex }}] {{ item.chapterTitle }}
              </div>
            </td>
            <td class="px-4 py-3 text-red-500 text-xs w-64 truncate" :title="item.errorMessage">
              {{ item.errorMessage }}
            </td>
            <td class="px-4 py-3">{{ item.retryCount }}/{{ item.maxRetries }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded text-xs" 
                :class="{
                  'bg-yellow-100 text-yellow-800': item.status === 'pending',
                  'bg-blue-100 text-blue-800': item.status === 'retrying',
                  'bg-red-100 text-red-800': item.status === 'failed',
                  'bg-green-100 text-green-800': item.status === 'resolved'
                }"
              >
                {{ 
                  { pending: '待处理', retrying: '重试中', failed: '失败', resolved: '已解决' }[item.status] || item.status
                }}
              </span>
            </td>
            <td class="px-4 py-3 space-x-2">
              <button @click="markRetrying(item.id)" class="text-blue-600 hover:underline">重试</button>
              <button @click="markResolved(item.id)" class="text-green-600 hover:underline">解决</button>
              <button @click="deleteFailure(item.id)" class="text-red-600 hover:underline">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
