<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Search', query: { q: searchQuery.value } })
  }
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
        HN Novels
      </router-link>

      <!-- Search -->
      <div class="flex-1 max-w-lg mx-4">
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索书名..." 
            class="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm"
            @keyup.enter="handleSearch"
          >
          <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <!-- Nav -->
      <nav class="hidden md:flex items-center space-x-6">
        <router-link to="/" class="text-gray-600 hover:text-orange-500 font-medium">首页</router-link>
        <router-link to="/rank" class="text-gray-600 hover:text-orange-500 font-medium">排行</router-link>
        <router-link to="/category/all" class="text-gray-600 hover:text-orange-500 font-medium">分类</router-link>
        <router-link to="/history" class="text-gray-600 hover:text-orange-500 font-medium">记录</router-link>
        <div class="relative group">
          <button class="text-gray-600 hover:text-orange-500 font-medium flex items-center gap-1">
            管理
          </button>
          <div class="absolute right-0 top-full pt-2 hidden group-hover:block w-32">
            <div class="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1">
              <router-link to="/admin/datasource" class="block px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-500">数据源</router-link>
              <router-link to="/admin/failures" class="block px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-500">失败记录</router-link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>
