<script setup>
import { ref, reactive, onMounted, onUnmounted, provide, computed, nextTick } from 'vue'
import api from '@/api'
import CrawlerConfig from '@/components/CrawlerConfig.vue'
import PagePreview from '@/components/PagePreview.vue'
import {
  DocumentTextIcon, ComputerDesktopIcon, EyeIcon, PlusIcon,
  PlayIcon, PauseIcon, StopIcon, MagnifyingGlassIcon,
  ArrowDownTrayIcon, ArrowLongDownIcon, TrashIcon
} from '@heroicons/vue/24/outline'

// State
const datasources = ref([])
const activeDatasourceId = ref(null)
const crawlerStatus = ref('idle')
const activeTab = ref('preview') // 'preview' or 'logs'
const logs = ref([])
const previewUrl = ref('')

// Config State
// We need a complete default config object structure
const defaultConfig = {
  id: '',
  name: 'New Datasource',
  url: '',
  delay: 200,
  timeout: 10000,
  crawlMode: 'deep',
  novelsPerPage: 1,
  outputMode: 'local',
  outputDir: 'novels',
  database: {
    host: '5257100.xyz',
    port: 3306,
    user: 'root',
    password: 'Mass@test2022',
    dbName: 'hn_novels'
  },
  listSelector: '',
  fields: {
    title: '',
    author: '',
    link: '',
    cover: '',
    description: '',
    content: ''
  },
  customFields: [],
  filterRegex: '',
  crawlMode: 'deep',
  novelsPerPage: 1,
  outputMode: 'database',
  pagination: {
    mode: 'single',
    nextSelector: '',
    maxPages: 10,
    startPage: 1,
    endPage: 10,
    urlPattern: '',
    autoIncrement: false
  },
  stages: {
    detail: {
      enabled: false,
      linkSelector: '',
      directorySelector: ''
    },
    directory: {
      enabled: false,
      urlPattern: '',
      chapterListSelector: '',
      chapterLinkSelector: ''
    }
  },
  database: {
    host: '5257100.xyz',
    port: 3306,
    user: 'root',
    password: 'Mass@test2022',
    dbName: 'hn_novels'
  },
  multiThread: true,
  threadCount: 8,
}

const currentConfig = reactive(JSON.parse(JSON.stringify(defaultConfig)))

// Methods
const fetchDatasources = async () => {
  try {
    const res = await api.get('/datasources')
    datasources.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

const selectDatasource = async (id) => {
  try {
    const res = await api.get(`/datasources/${id}`)
    const data = res.data
    // Deep merge or assign to currentConfig
    activeDatasourceId.value = id
    
    // Reset then Assign
    Object.assign(currentConfig, JSON.parse(JSON.stringify(defaultConfig)))
    
    // Map backend data to config structure
    currentConfig.id = data.id
    currentConfig.name = data.name
    currentConfig.url = data.url
    
    currentConfig.crawlMode = data.crawlMode || 'deep'
    currentConfig.delay = data.delay || 200
    currentConfig.timeout = data.timeout || 10000
    currentConfig.novelsPerPage = (data.novelsPerPage !== undefined && data.novelsPerPage !== null) ? data.novelsPerPage : 1
    currentConfig.outputMode = data.outputMode || 'local'
    currentConfig.outputDir = data.outputDir || 'novels'
    if (data.database) {
        currentConfig.database = { ...defaultConfig.database, ...data.database }
    }
    if (data.selectors) {
      currentConfig.listSelector = data.selectors.list || ''
      currentConfig.fields.title = data.selectors.title || ''
      currentConfig.fields.link = data.selectors.link || '' // often same as title
      currentConfig.fields.content = data.selectors.content || ''
      currentConfig.pagination.nextSelector = data.selectors.nextPage || ''
      
      // Load Author, Category, Status Selectors
      currentConfig.fields.author = data.selectors.author || ''
      currentConfig.fields.category = data.selectors.type || ''
      currentConfig.fields.status = data.selectors.status || ''
      
      // Load Regex Configs
      currentConfig.fields.titleRegex = data.selectors.titleRegex || ''
      currentConfig.fields.authorRegex = data.selectors.authorRegex || ''
      currentConfig.fields.categoryRegex = data.selectors.typeRegex || ''
      currentConfig.fields.statusRegex = data.selectors.statusRegex || ''
    }

    if (data.pagination) {
       currentConfig.pagination.mode = data.pagination.mode || 'single'
       currentConfig.pagination.maxPages = (data.pagination.maxPages !== undefined && data.pagination.maxPages !== null) ? data.pagination.maxPages : 10
       currentConfig.pagination.startPage = data.pagination.startPage || 1
       currentConfig.pagination.endPage = data.pagination.endPage || 10
       currentConfig.pagination.urlPattern = data.pagination.urlPattern || ''
       currentConfig.pagination.autoIncrement = !!data.pagination.autoIncrement
    }

    if (data.stages) {
      if (data.stages.detail) {
         currentConfig.stages.detail.enabled = !!data.stages.detail.enabled
         currentConfig.stages.detail.directorySelector = data.stages.detail.directorySelector || ''
      }
      if (data.stages.directory) {
         currentConfig.stages.directory.enabled = !!data.stages.directory.enabled
         currentConfig.stages.directory.chapterListSelector = data.stages.directory.chapterListSelector || ''
      }
      }


    if (data.multiThread !== undefined) {
      currentConfig.multiThread = !!data.multiThread;
      currentConfig.threadCount = data.threadCount || 8;
    }
    
    currentConfig.customFields = data.customFields || []
    
    // Update preview URL always
    previewUrl.value = data.url
    
  } catch (e) {
    console.error(e)
  }
}

const createDatasource = () => {
    activeDatasourceId.value = null
    Object.assign(currentConfig, JSON.parse(JSON.stringify(defaultConfig)))
    currentConfig.name = "未命名数据源"
    previewUrl.value = ''
}

const saveConfig = async () => {
  const payload = {
    name: currentConfig.name,
    url: currentConfig.url,
    delay: currentConfig.delay,
    timeout: currentConfig.timeout,
    selectors: {
      list: currentConfig.listSelector,
      title: currentConfig.fields.title,
      link: currentConfig.fields.title, // Simplified binding
      content: currentConfig.fields.content,
      nextPage: currentConfig.pagination.nextSelector,
      // Author, Category (Type), Status selectors
      author: currentConfig.fields.author,
      type: currentConfig.fields.category,
      status: currentConfig.fields.status,
      // Regex Configs
      titleRegex: currentConfig.fields.titleRegex,
      authorRegex: currentConfig.fields.authorRegex,
      typeRegex: currentConfig.fields.categoryRegex,
      statusRegex: currentConfig.fields.statusRegex,
    },
    pagination: currentConfig.pagination,
    stages: currentConfig.stages,
    customFields: currentConfig.customFields,
    filterRegex: currentConfig.filterRegex,
    crawlMode: currentConfig.crawlMode,
    novelsPerPage: currentConfig.novelsPerPage,
    outputMode: currentConfig.outputMode,
    outputDir: currentConfig.outputDir,
    multiThread: currentConfig.multiThread,
    threadCount: currentConfig.threadCount,
    // Database defaults are hardcoded in backend or this logic for Lite
    database: currentConfig.database
  }

  try {
    if (activeDatasourceId.value) {
      await api.put(`/datasources/${activeDatasourceId.value}`, payload)
    } else {
      const res = await api.post('/datasources', payload)
      activeDatasourceId.value = res.data.id
    }
    alert('保存成功')
    fetchDatasources()
  } catch (e) {
    alert('保存失败')
  }
}

const handleStart = async () => {
  try {
    // Save first to ensure we run latest
    // await saveConfig() // Optional: auto-save
    await api.post('/crawler/start', currentConfig)
    crawlerStatus.value = 'running'
    activeTab.value = 'logs'
    connectLogStream()
  } catch (e) {
    alert(e.message)
  }
}

const handleStop = async () => {
  await api.post('/crawler/stop')
}

const handlePause = async () => {
  await api.post('/crawler/pause')
}

// Refs
const pagePreviewRef = ref(null)

const handlePreview = (url) => {
  previewUrl.value = url
  activeTab.value = 'preview'
  nextTick(() => {
    pagePreviewRef.value?.loadPage()
  })
}

// Selector Selection Logic
const handleSelectorSelected = (field, selector) => {
  console.log('Selected:', field, selector)
  if (field === 'list') {
    currentConfig.listSelector = selector
  } else if (field === 'title' || field === 'link') {
    currentConfig.fields.title = selector
    currentConfig.fields.link = selector
  } else if (field === 'content') {
    currentConfig.fields.content = selector
  } else if (field === 'next') {
    currentConfig.pagination.nextSelector = selector
  } else if (field === 'chapterList') {
    // New: Handle Chapter List Selector (Directory Stage)
    currentConfig.stages.directory.chapterListSelector = selector
    currentConfig.stages.directory.enabled = true
  } else if (field === 'directory') {
    currentConfig.stages.detail.directorySelector = selector
    currentConfig.stages.detail.enabled = true
  } else if (field === 'author') {
    currentConfig.fields.author = selector
  } else if (field === 'cover') {
    currentConfig.fields.cover = selector
  } else if (field === 'description') {
    currentConfig.fields.description = selector
  }
  
  // Check custom fields
  const cf = currentConfig.customFields.find(f => f.key === field)
  if (cf) cf.selector = selector
}

// Logs
let eventSource = null
// Log Utilities
const searchQuery = ref('')
const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter(l => 
    l.message.toLowerCase().includes(q) || 
    (l.timestamp && new Date(l.timestamp).toLocaleTimeString().toLowerCase().includes(q))
  )
})

const downloadLogs = () => {
  if (logs.value.length === 0) return
  const content = logs.value.map(l => `[${new Date(l.timestamp).toLocaleString()}] [${l.level.toUpperCase()}] ${l.message}`).join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `crawler_logs_${new Date().toISOString().slice(0,19).replace(/T|:/g, '-')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const scrollToBottom = () => {
  const container = document.getElementById('log-container')
  if (container) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }
}

const connectLogStream = () => {
  if (eventSource) eventSource.close()
  eventSource = new EventSource('/api/crawler/logs')
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'log') {
        const isProgressLog = data.message.startsWith('⏳')
        if (isProgressLog && logs.value.length > 0) {
           const lastLog = logs.value[logs.value.length - 1]
           // If last log was also progress, replace it
           if (lastLog.message.startsWith('⏳')) {
               lastLog.message = data.message
               lastLog.timestamp = data.timestamp
               lastLog.level = data.level
           } else {
               logs.value.push(data)
           }
        } else {
             logs.value.push(data)
        }

        if (logs.value.length > 1000) logs.value.shift()
        
        // Auto scroll if near bottom
        const container = document.getElementById('log-container')
        if (container) {
             const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
             if (isNearBottom) {
                 nextTick(() => container.scrollTop = container.scrollHeight)
             }
        }
      } else if (data.type === 'status') {
        crawlerStatus.value = data.status
      }
    } catch (e) {}
  }
}


onMounted(() => {
  fetchDatasources()
})

onUnmounted(() => {
  if (eventSource) eventSource.close()
})
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex flex-col bg-gray-50 overflow-hidden">
    <!-- Top Bar -->
    <div class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
      <div class="flex items-center gap-4">
        <h1 class="font-bold text-gray-800 flex items-center gap-2">
          <span class="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><DocumentTextIcon class="w-5 h-5"/></span>
          数据源配置
        </h1>
        <div class="h-6 w-px bg-gray-200"></div>
        <select 
          :value="activeDatasourceId"
          @change="(e) => selectDatasource(e.target.value)"
          class="border border-gray-300 rounded-md text-sm py-1.5 pl-3 pr-8 outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
        >
          <option :value="null" disabled>选择数据源...</option>
          <option v-for="ds in datasources" :key="ds.id" :value="ds.id">{{ ds.name }}</option>
        </select>
        <button @click="createDatasource" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md text-sm font-medium flex items-center gap-1">
          <PlusIcon class="w-4 h-4" /> 新增
        </button>
      </div>
      <div>
        <div class="flex items-center gap-2">
           <input 
            v-model="currentConfig.name" 
            placeholder="数据源名称" 
            class="border border-transparent hover:border-gray-300 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none bg-transparent focus:bg-white transition-all text-right font-medium"
          >
          <button 
            @click="saveConfig"
            class="bg-blue-600 text-white px-5 py-1.5 rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm transition-all hover:shadow"
          >保存配置</button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Config -->
      <div class="w-[640px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col z-10">
        <CrawlerConfig 
          :config="currentConfig" 
          :status="crawlerStatus"
          @start="handleStart"
          @stop="handleStop"
          @pause="handlePause"
          @preview="handlePreview"
        />
        
        <!-- Regex Configuration Guide (Helper Text) -->
        <div class="px-6 py-4 bg-blue-50 border-t border-blue-100 text-sm text-blue-700">
           <p class="font-bold mb-1">💡 高级选择器语法:</p>
           <ul class="list-disc pl-5 space-y-1">
             <li><strong>链接前文本:</strong> <code>p.line::text-before(a)</code> → 提取 &lt;a&gt; 标签前的文字</li>
             <li><strong>链接后文本:</strong> <code>p.line::text-after(a)</code> → 提取 &lt;a&gt; 标签后的文字</li>
             <li><strong>正则提取 (Regex):</strong> 填写正则，用 <code>(.*?)</code> 表示要提取的内容</li>
             <li>示例 <code>\[(.*?)\]</code> 提取方括号内容，<code>作者:(.*)</code> 提取冒号后内容</li>
           </ul>
        </div>
      </div>

      <!-- Right: Preview / Logs -->
      <div class="flex-1 flex flex-col bg-gray-100 min-w-0">
        <!-- Tabs -->
        <div class="flex border-b border-gray-200 bg-white">
          <button 
            @click="activeTab = 'preview'"
            class="px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors hover:bg-gray-50"
            :class="activeTab === 'preview' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500'"
          >
            <ComputerDesktopIcon class="w-4 h-4" /> 页面预览
          </button>
          <button 
            @click="activeTab = 'logs'"
            class="px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors hover:bg-gray-50"
            :class="activeTab === 'logs' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500'"
          >
            <EyeIcon class="w-4 h-4" /> 抓取日志
          </button>
        </div>

        <div class="flex-1 p-4 overflow-hidden relative">
          <!-- Preview Tab -->
          <div v-show="activeTab === 'preview'" class="h-full">
            <PagePreview 
              ref="pagePreviewRef"
              :url="previewUrl" 
              :custom-fields="currentConfig.customFields"
              @selector-selected="handleSelectorSelected"
            />
          </div>

          <!-- Logs Tab -->
          <div v-show="activeTab === 'logs'" class="h-full bg-gray-900 rounded-xl overflow-hidden flex flex-col shadow-inner border border-gray-700">
            <!-- Log Toolbar -->
            <div class="p-2 border-b border-gray-800 bg-gray-800/50 flex justify-between items-center gap-4">
              <div class="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 flex-1 max-w-sm">
                 <MagnifyingGlassIcon class="w-4 h-4 text-gray-500" />
                 <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="搜索日志..." 
                  class="bg-transparent border-none outline-none text-xs text-gray-300 w-full placeholder-gray-600 focus:ring-0 p-0"
                 >
                 <span v-if="searchQuery" class="text-[10px] text-gray-500">{{ filteredLogs.length }}条</span>
              </div>
              
              <div class="flex items-center gap-1">
                 <button @click="downloadLogs" class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition" title="下载日志">
                    <ArrowDownTrayIcon class="w-4 h-4" />
                 </button>
                 <button @click="scrollToBottom" class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition" title="滚动到底部">
                    <ArrowLongDownIcon class="w-4 h-4" />
                 </button>
                 <button @click="logs = []" class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition" title="清空日志">
                    <TrashIcon class="w-4 h-4" />
                 </button>
              </div>
            </div>
            <div id="log-container" class="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 custom-scrollbar">
               <div v-if="logs.length === 0" class="text-gray-600 text-center mt-20 select-none flex flex-col items-center gap-3">
                  <DocumentTextIcon class="w-8 h-8 opacity-20" />
                  <span>暂无日志</span>
               </div>
               <div v-if="logs.length > 0 && filteredLogs.length === 0" class="text-gray-500 text-center mt-10">
                  未找到匹配日志
               </div>
               <div v-for="(log, i) in filteredLogs" :key="i" class="break-all leading-relaxed hover:bg-gray-800/30 -mx-2 px-2 rounded">
                  <span class="text-gray-500 select-none mr-2">[{{ new Date(log.timestamp).toLocaleTimeString() }}]</span>
                  <span :class="{
                    'text-green-400': log.level === 'success',
                    'text-yellow-400': log.level === 'warning',
                    'text-red-400': log.level === 'error',
                    'text-blue-300': log.level === 'info'
                  }"> {{ log.message }}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Global overrides/helper styles */
</style>
