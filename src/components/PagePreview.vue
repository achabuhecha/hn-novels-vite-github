<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import {
  LinkIcon, ArrowPathIcon, ComputerDesktopIcon, 
  ListBulletIcon, DocumentTextIcon, FolderIcon, 
  TagIcon, ArrowRightIcon, UserIcon, PhotoIcon, Bars3BottomLeftIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  url: String,
  customFields: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['selector-selected'])

const currentUrl = ref('')
const pageContent = ref('')
const loading = ref(false)
const loaded = ref(false)
const errorMsg = ref('')
const iframeRef = ref(null)
const selectedSelector = ref('')
const selectionMode = ref(false)
const selectionField = ref('')

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0
})

watch(() => props.url, (newUrl) => {
  if (newUrl && newUrl !== currentUrl.value) {
    currentUrl.value = newUrl
    loadPage()
  }
})

const loadPage = async () => {
  if (!currentUrl.value && props.url) {
    currentUrl.value = props.url
  }

  if (!currentUrl.value) {
    alert('请先输入URL')
    return
  }
  
  if (loading.value) return
  
  loading.value = true
  loaded.value = false
  errorMsg.value = ''
  
  try {
    const response = await fetch('/api/crawler/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: currentUrl.value })
    })
    
    if (!response.ok) throw new Error('加载失败')
    
    let html = await response.text()
    
    // Injected Script for Visual Selection
    const script = `
      <script>
        function generateSelector(element) {
          if (element.className && typeof element.className === 'string') {
            var classes = element.className.trim().split(/\\s+/).filter(function(c) { 
              return c && c.indexOf('preview-') !== 0; 
            });
            if (classes.length > 0) {
              return '.' + classes.slice(0, 2).join('.');
            }
          }
          if (element.id) {
            return '#' + element.id;
          }
          var path = [];
          while (element && element.nodeType === 1) {
            var selector = element.tagName.toLowerCase();
            if (element.className && typeof element.className === 'string') {
              var cls = element.className.trim().split(/\\s+/).filter(function(c) { 
                return c && c.indexOf('preview-') !== 0; 
              });
              if (cls.length > 0) {
                selector += '.' + cls.slice(0, 2).join('.');
              }
            }
            path.unshift(selector);
            element = element.parentElement;
            if (path.length >= 3) break;
          }
          return path.join(' > ');
        }
        
        document.addEventListener('click', function(e) {
          window.parent.postMessage({ type: 'preview-click' }, '*');
          var link = e.target.closest('a');
          if (link && link.href) {
            e.preventDefault();
            e.stopPropagation();
            window.parent.postMessage({ type: 'preview-navigate', url: link.href }, '*');
          }
        }, true);
        
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var selector = generateSelector(e.target);
          window.parent.postMessage({ 
            type: 'element-contextmenu', 
            selector, 
            x: e.clientX, 
            y: e.clientY,
            tagName: e.target.tagName
          }, '*');
        }, true);
        
        document.addEventListener('mouseover', function(e) {
          var hovers = document.querySelectorAll('.preview-hover');
          for (var i = 0; i < hovers.length; i++) {
            hovers[i].classList.remove('preview-hover');
          }
          e.target.classList.add('preview-hover');
        }, true);
      <\/script>
      <style>
        .preview-hover {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px;
          cursor: pointer !important;
        }
      </style>
    `
    
    html = html.replace('</body>', script + '</body>')
    pageContent.value = html
    loaded.value = true
  } catch (error) {
    errorMsg.value = error.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const handleMessage = (event) => {
  if (event.data.type === 'element-contextmenu') {
    const iframeRect = iframeRef.value?.getBoundingClientRect()
    if (iframeRect) {
        let menuX = iframeRect.left + event.data.x
        let menuY = iframeRect.top + event.data.y
        
        // Boundary check: Flip up if near bottom
        const estimatedHeight = 300
        if (menuY + estimatedHeight > window.innerHeight) {
            menuY -= estimatedHeight
        }

        // Boundary check: Flip left if near right edge
        const estimatedWidth = 200
        if (menuX + estimatedWidth > window.innerWidth) {
            menuX -= estimatedWidth
        }
        
        contextMenu.x = menuX
        contextMenu.y = menuY
        selectedSelector.value = event.data.selector
        contextMenu.visible = true
    }
  } else if (event.data.type === 'preview-navigate') {
    currentUrl.value = event.data.url
    loadPage()
  } else if (event.data.type === 'preview-click') {
    contextMenu.visible = false
  }
}

const setAsSelector = (field) => {
  emit('selector-selected', field, selectedSelector.value)
  contextMenu.visible = false
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  document.addEventListener('click', () => contextMenu.visible = false)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

defineExpose({ loadPage })
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
      <div class="flex-1 relative">
        <LinkIcon class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input 
          v-model="currentUrl" 
          @keyup.enter="loadPage"
          type="text" 
          placeholder="输入 URL..." 
          class="w-full pl-9 pr-16 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
        <button 
          @click="loadPage"
          class="absolute right-1 top-1 bottom-1 px-3 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100"
        >加载</button>
      </div>
      <button 
        @click="loadPage" 
        :disabled="!loaded"
        class="p-2 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-50"
      >
        <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': loading }" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 relative bg-gray-100">
      <!-- Empty State -->
      <div v-if="!loaded && !loading" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
        <ComputerDesktopIcon class="w-16 h-16 mb-4 opacity-50" />
        <p>输入 URL 预览页面并提取选择器</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
        <ArrowPathIcon class="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p class="text-sm text-gray-600">加载中...</p>
      </div>

      <!-- Error -->
      <div v-if="errorMsg && !loading" class="absolute inset-0 flex flex-col items-center justify-center text-red-500">
        <p class="mb-4">{{ errorMsg }}</p>
        <button @click="loadPage" class="px-4 py-2 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50">重试</button>
      </div>

      <!-- Iframe -->
      <iframe 
        v-show="loaded"
        ref="iframeRef"
        :srcdoc="pageContent"
        class="w-full h-full bg-white"
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </div>

    <!-- Context Menu -->
    <div 
      v-if="contextMenu.visible"
      class="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 min-w-[180px]"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <button @click="setAsSelector('list')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <ListBulletIcon class="w-4 h-4" /> 设为列表选择器
      </button>
      <button @click="setAsSelector('title')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <DocumentTextIcon class="w-4 h-4" /> 设为标题选择器
      </button>
      <button @click="setAsSelector('link')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <LinkIcon class="w-4 h-4" /> 设为链接选择器
      </button>
      <button @click="setAsSelector('author')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <UserIcon class="w-4 h-4" /> 设为作者选择器
      </button>
      <button @click="setAsSelector('cover')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <PhotoIcon class="w-4 h-4" /> 设为封面选择器
      </button>
      <button @click="setAsSelector('description')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <Bars3BottomLeftIcon class="w-4 h-4" /> 设为简介选择器
      </button>
       <div class="h-px bg-gray-100 my-1"></div>
      <button @click="setAsSelector('content')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <DocumentTextIcon class="w-4 h-4" /> 设为内容选择器
      </button>
      <div class="h-px bg-gray-100 my-1"></div>
      <button @click="setAsSelector('chapterList')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <ListBulletIcon class="w-4 h-4" /> 设为章节列表选择器
      </button>
      <button @click="setAsSelector('directory')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <FolderIcon class="w-4 h-4" /> 设为完整目录按钮
      </button>
      <div class="h-px bg-gray-100 my-1"></div>
      <button @click="setAsSelector('next')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
        <ArrowRightIcon class="w-4 h-4" /> 设为下一页
      </button>
      
      <!-- Custom Fields -->
      <template v-if="customFields.length > 0">
        <div class="h-px bg-gray-100 my-1"></div>
        <button 
          v-for="field in customFields" 
          :key="field.key"
          @click="setAsSelector(field.key)"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
        >
          <TagIcon class="w-4 h-4" /> 设为 {{ field.label || field.key }}
        </button>
      </template>
    </div>
  </div>
</template>
