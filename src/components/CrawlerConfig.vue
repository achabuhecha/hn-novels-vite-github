<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  LinkIcon, AdjustmentsHorizontalIcon, FunnelIcon, 
  ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon,
  Cog6ToothIcon, SparklesIcon
} from '@heroicons/vue/24/outline'

const props = defineProps(['config', 'status'])
const emit = defineEmits(['start', 'pause', 'stop', 'update:config', 'preview'])

// Configuration reference logic to sync with parent
// We modify the prop directly as it's an object (reactive), 
// but it's cleaner to emit updates if we were strict. 
// For simplicity in this Lite version, we'll mutate the nested state 
// but emit update for the parent to know.

const activeSections = reactive({
  basic: true,
  mode: true,
  rules: true,
  filter: false,
  advanced: false
})

const toggleSection = (key) => {
  activeSections[key] = !activeSections[key]
}

const addCustomField = () => {
  if (!props.config.customFields) props.config.customFields = []
  props.config.customFields.push({ label: '', key: '', selector: '' })
}

const removeCustomField = (index) => {
  props.config.customFields.splice(index, 1)
}

const canStart = computed(() => {
  // 只需要 URL 即可开始（后端会自动探测或使用通用选择器）
  return !!props.config.url
})
</script>

<template>
  <div class="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
    
    <!-- Controls -->
    <div class="flex gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100 justify-center">
      <button 
        @click="$emit('start')"
        :disabled="!canStart || status === 'running'"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
        </svg>
        开始
      </button>
      <button 
        @click="$emit('pause')"
        :disabled="status !== 'running'"
        class="px-6 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
        </svg>
        暂停
      </button>
      <button 
        @click="$emit('stop')"
        :disabled="status === 'idle'"
        class="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clip-rule="evenodd" />
        </svg>
        停止
      </button>
    </div>

    <!-- 1. Basic Config -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        @click="toggleSection('basic')"
        class="bg-gray-50 px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-gray-100"
      >
        <div class="flex items-center gap-2 font-medium text-gray-700">
          <LinkIcon class="w-5 h-5 text-gray-500" />
          数据源配置
        </div>
        <component :is="activeSections.basic ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-gray-400" />
      </div>
      <div v-show="activeSections.basic" class="p-4 space-y-4 bg-white">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">数据源 URL</label>
          <div class="flex gap-2">
            <input 
              v-model="config.url" 
              type="text" 
              class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
              placeholder="https://..."
            >
            <button 
              @click="$emit('preview', config.url)"
              class="px-3 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 border border-gray-200"
            >预览</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">请求延迟 (ms)</label>
            <input v-model.number="config.delay" type="number" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">超时时间 (ms)</label>
            <input v-model.number="config.timeout" type="number" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none">
          </div>
        </div>
      </div>
    </div>

    <!-- 1.5. Crawl Mode -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        @click="toggleSection('mode')"
        class="bg-gray-50 px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-gray-100"
      >
        <div class="flex items-center gap-2 font-medium text-gray-700">
          <SparklesIcon class="w-5 h-5 text-gray-500" />
          抓取模式
          <span class="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">重要</span>
        </div>
        <component :is="activeSections.mode ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-gray-400" />
      </div>
      <div v-show="activeSections.mode" class="p-4 space-y-4 bg-white">
        
        <!-- Mode Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">抓取模式</label>
          <div class="flex bg-gray-100 p-1 rounded-lg">
             <button 
               @click="config.crawlMode = 'list'"
               class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all"
               :class="config.crawlMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
             >仅列表</button>
             <button 
               @click="config.crawlMode = 'deep'"
               class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all"
               :class="config.crawlMode === 'deep' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
             >完整抓取</button>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            {{ config.crawlMode === 'list' ? '仅抓取列表页信息（需要配置选择器）' : '抓取小说详情和章节内容' }}
          </p>
        </div>

        <!-- Novels Per Page -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">每页限制</label>
            <div class="flex items-center gap-2">
                <input v-model.number="config.novelsPerPage" type="number" min="1" max="50" class="w-24 border border-gray-300 rounded px-3 py-2 text-sm outline-none">
                <span class="text-sm text-gray-500">本/页</span>
            </div>
        </div>

        <!-- Output Config (Only for Deep Mode) -->
        <div v-if="config.crawlMode === 'deep'" class="border-t border-gray-100 pt-4">
            <div class="text-xs font-bold text-gray-500 uppercase mb-3">输出配置</div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">输出方式</label>
                    <select v-model="config.outputMode" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-white">
                        <option value="local">保存到本地 (TXT)</option>
                        <option value="database">保存到数据库 (MySQL)</option>
                    </select>
                </div>

                <!-- Local Output -->
                <div v-if="config.outputMode === 'local'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">输出目录</label>
                    <input v-model="config.outputDir" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" placeholder="novels">
                    <p class="text-xs text-gray-500 mt-1">支持相对路径或绝对路径</p>
                </div>

                <!-- Database Output -->
                <div v-if="config.outputMode === 'database'" class="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div class="grid grid-cols-3 gap-3">
                        <div class="col-span-2">
                             <label class="block text-xs text-gray-500 mb-1">数据库地址</label>
                             <input v-model="config.database.host" type="text" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none bg-white">
                        </div>
                        <div>
                             <label class="block text-xs text-gray-500 mb-1">端口</label>
                             <input v-model.number="config.database.port" type="number" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none bg-white">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                             <label class="block text-xs text-gray-500 mb-1">用户名</label>
                             <input v-model="config.database.user" type="text" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none bg-white">
                        </div>
                        <div>
                             <label class="block text-xs text-gray-500 mb-1">密码</label>
                             <input v-model="config.database.password" type="password" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none bg-white">
                        </div>
                    </div>
                    <div>
                         <label class="block text-xs text-gray-500 mb-1">数据库名</label>
                         <input v-model="config.database.dbName" type="text" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none bg-white">
                    </div>
                </div>
                
                <div class="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-800 rounded border border-yellow-100 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
                    </svg>
                    {{ config.outputMode === 'database' ? '小说内容将保存到指定的 MySQL 数据库' : '小说内容将导出为 TXT 文件到本地目录' }}
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- 2. Rules -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        @click="toggleSection('rules')"
        class="bg-gray-50 px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-gray-100"
      >
        <div class="flex items-center gap-2 font-medium text-gray-700">
          <AdjustmentsHorizontalIcon class="w-5 h-5 text-gray-500" />
          抓取规则
        </div>
        <component :is="activeSections.rules ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-gray-400" />
      </div>
      <div v-show="activeSections.rules" class="p-4 space-y-4 bg-white">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">列表选择器</label>
          <input v-model="config.listSelector" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" placeholder=".book-list li">
        </div>
        
        <div class="border-t border-gray-100 pt-4">
          <div class="text-xs font-bold text-gray-500 uppercase mb-3">核心字段</div>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">标题/链接选择器</label>
              <div class="flex gap-2">
                 <input v-model="config.fields.title" type="text" class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none" placeholder="a">
                 <input v-model="config.fields.titleRegex" type="text" class="w-1/3 border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-blue-50/50 text-blue-800 placeholder-blue-300" placeholder="Regex (可选)">
              </div>
              <p class="text-xs text-gray-400 mt-1">同时也作为链接选择器</p>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">内容选择器</label>
              <input v-model="config.fields.content" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" placeholder="#content">
            </div>
            
            <!-- Standard Fields with Optional Regex -->
            <div class="grid grid-cols-2 gap-4 mt-2">
                <div>
                   <label class="block text-xs text-gray-500 mb-1">作者选择器</label>
                   <div class="flex gap-2">
                       <input v-model="config.fields.author" type="text" class="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none">
                       <input v-model="config.fields.authorRegex" type="text" class="w-1/3 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none bg-blue-50/50 text-blue-800 placeholder-blue-300" placeholder="Regex">
                   </div>
                </div>
                 <div>
                   <label class="block text-xs text-gray-500 mb-1">类型/分类选择器</label>
                   <div class="flex gap-2">
                       <input v-model="config.fields.category" type="text" class="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none">
                       <input v-model="config.fields.categoryRegex" type="text" class="w-1/3 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none bg-blue-50/50 text-blue-800 placeholder-blue-300" placeholder="Regex">
                   </div>
                </div>
                 <div>
                   <label class="block text-xs text-gray-500 mb-1">状态选择器</label>
                   <div class="flex gap-2">
                       <input v-model="config.fields.status" type="text" class="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none">
                       <input v-model="config.fields.statusRegex" type="text" class="w-1/3 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none bg-blue-50/50 text-blue-800 placeholder-blue-300" placeholder="Regex">
                   </div>
                </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex justify-between items-center mb-3">
            <div class="text-xs font-bold text-gray-500 uppercase">自定义字段</div>
            <button @click="addCustomField" class="text-blue-500 hover:text-blue-600 text-xs flex items-center">
              <PlusIcon class="w-3 h-3 mr-1" /> 添加
            </button>
          </div>
          
          <div v-for="(field, index) in config.customFields" :key="index" class="flex gap-2 mb-2 items-center">
            <input v-model="field.label" placeholder="名称" class="w-1/5 border border-gray-300 rounded px-2 py-1.5 text-xs outline-none">
            <input v-model="field.key" placeholder="Key" class="w-1/5 border border-gray-300 rounded px-2 py-1.5 text-xs outline-none bg-gray-50">
            <input v-model="field.selector" placeholder="Selector" class="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs outline-none">
            <input v-model="field.regex" placeholder="Regex (可选)" class="w-1/4 border border-gray-300 rounded px-2 py-1.5 text-xs outline-none bg-blue-50/50 text-blue-800 placeholder-blue-300">
            <button @click="removeCustomField(index)" class="text-gray-400 hover:text-red-500">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
           <div class="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            多阶段抓取 <span class="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded">可选</span>
          </div>
          <div class="space-y-4">
             <!-- 1. Detail Page Stage -->
             <div class="border border-gray-100 rounded-lg p-3">
               <div class="flex items-center justify-between mb-2">
                  <div>
                     <label class="block text-xs font-medium text-gray-700">启用详情页</label>
                     <p class="text-[10px] text-gray-500">从列表跳转到详情页获取更多信息</p>
                  </div>
                   <!-- Toggle Switch -->
                  <div 
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                    :class="config.stages.detail.enabled ? 'bg-blue-600' : 'bg-gray-200'"
                    @click="config.stages.detail.enabled = !config.stages.detail.enabled"
                  >
                    <span 
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      :class="config.stages.detail.enabled ? 'translate-x-5' : 'translate-x-1'"
                    />
                  </div>
               </div>
               
               <div v-if="config.stages.detail.enabled" class="mt-3 pt-3 border-t border-gray-100">
                  <label class="block text-xs text-gray-500 mb-1">完整目录按钮选择器</label>
                  <input v-model="config.stages.detail.directorySelector" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" placeholder=".btn-directory">
                  <p class="text-[10px] text-gray-400 mt-1">详情页中跳转到完整目录的按钮/链接</p>
               </div>
             </div>

             <!-- 2. Directory Page Stage -->
             <div class="border border-gray-100 rounded-lg p-3">
               <div class="flex items-center justify-between mb-2">
                  <div>
                     <label class="block text-xs font-medium text-gray-700">启用目录页</label>
                     <p class="text-[10px] text-gray-500">配置目录页的章节列表选择器</p>
                  </div>
                   <div 
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                    :class="config.stages.directory.enabled ? 'bg-blue-600' : 'bg-gray-200'"
                    @click="config.stages.directory.enabled = !config.stages.directory.enabled"
                  >
                    <span 
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      :class="config.stages.directory.enabled ? 'translate-x-5' : 'translate-x-1'"
                    />
                  </div>
               </div>
               
                <div v-if="config.stages.directory.enabled" class="mt-3 pt-3 border-t border-gray-100">
                  <label class="block text-xs text-gray-500 mb-1">章节列表选择器</label>
                  <input v-model="config.stages.directory.chapterListSelector" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" placeholder=".chapter-list li a">
                  <p class="text-[10px] text-gray-400 mt-1">选择包含章节链接的列表项或直接选择链接</p>
               </div>
             </div>
          </div>
        </div>
        
        <div class="border-t border-gray-100 pt-4">
          <div class="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            分页设置 <span class="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">可选</span>
          </div>
          
          <div class="space-y-3">
             <div>
               <label class="block text-xs text-gray-500 mb-2">分页模式</label>
               <div class="flex bg-gray-100 p-1 rounded-lg">
                 <button 
                   v-for="mode in ['single', 'all', 'range']" 
                   :key="mode"
                   @click="config.pagination.mode = mode"
                   class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all"
                   :class="config.pagination.mode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                 >
                   {{ mode === 'single' ? '仅当前页' : (mode === 'all' ? '全部页面' : '指定范围') }}
                 </button>
               </div>
             </div>
             
             <div v-if="config.pagination.mode === 'range'" class="grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded-lg">
                <div>
                   <label class="block text-xs text-gray-500 mb-1">开始页码</label>
                   <input v-model.number="config.pagination.startPage" type="number" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none">
                </div>
                 <div>
                   <label class="block text-xs text-gray-500 mb-1">结束页码</label>
                   <input v-model.number="config.pagination.endPage" type="number" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none">
                </div>
             </div>

             <div v-if="config.pagination.mode === 'all'" class="bg-gray-50 p-2 rounded-lg">
                <label class="block text-xs text-gray-500 mb-1">最大页数限制 (0为不限)</label>
                <input v-model.number="config.pagination.maxPages" type="number" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none">
             </div>
             
             <div v-if="config.pagination.mode !== 'single'">
                <label class="block text-xs text-gray-500 mb-1">URL模式分页</label>
                <input v-model="config.pagination.urlPattern" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" placeholder="/list/{page}.html">
                <div class="flex items-center justify-between mt-2">
                  <p class="text-[10px] text-gray-400">使用 {page} 作为页码占位符</p>
                  
                  <div class="flex items-center gap-2">
                     <span class="text-[10px] text-gray-500">自动递增</span>
                     <div 
                        class="relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                        :class="config.pagination.autoIncrement ? 'bg-blue-600' : 'bg-gray-200'"
                        @click="config.pagination.autoIncrement = !config.pagination.autoIncrement"
                      >
                        <span 
                          class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
                          :class="config.pagination.autoIncrement ? 'translate-x-3.5' : 'translate-x-0.5'"
                        />
                      </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Filter -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        @click="toggleSection('filter')"
        class="bg-gray-50 px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-gray-100"
      >
        <div class="flex items-center gap-2 font-medium text-gray-700">
          <FunnelIcon class="w-5 h-5 text-gray-500" />
          内容过滤
        </div>
        <component :is="activeSections.filter ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-gray-400" />
      </div>
      <div v-show="activeSections.filter" class="p-4 space-y-4 bg-white">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">正则过滤</label>
          <input v-model="config.filterRegex" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" placeholder="正则表达式">
        </div>
      </div>
    </div>

    <!-- 4. Advanced -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        @click="toggleSection('advanced')"
        class="bg-gray-50 px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-gray-100"
      >
        <div class="flex items-center gap-2 font-medium text-gray-700">
          <Cog6ToothIcon class="w-5 h-5 text-gray-500" />
          高级选项
        </div>
        <component :is="activeSections.advanced ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-gray-400" />
      </div>
      <div v-show="activeSections.advanced" class="p-4 space-y-4 bg-white">
        <div class="flex items-center justify-between">
           <div>
              <label class="block text-sm font-medium text-gray-700">多线程</label>
              <p class="text-xs text-gray-500">启用并发抓取以提高速度</p>
           </div>
           
           <div 
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
            :class="config.multiThread ? 'bg-blue-600' : 'bg-gray-200'"
            @click="config.multiThread = !config.multiThread"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="config.multiThread ? 'translate-x-6' : 'translate-x-1'"
            />
          </div>
        </div>

        <div v-if="config.multiThread">
           <label class="block text-sm font-medium text-gray-700 mb-1">线程数</label>
           <input v-model.number="config.threadCount" type="number" min="1" max="32" class="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
</style>
