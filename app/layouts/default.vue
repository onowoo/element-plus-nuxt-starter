<template>
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="h-16 flex items-center justify-between px-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <img src="/favicon.png" alt="Logo" class="h-8 w-8" >
        <span class="text-lg font-semibold text-gray-800 dark:text-white">吉林女子学校</span>
      </div>
      <UiDarkToggle />
    </header>
    
    <main class="flex-1 p-4 max-w-7xl mx-auto w-full">
      <slot />
    </main>
      
    <footer class="h-16 px-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <span>©</span>
        <span>{{ new Date().getFullYear() }}</span>
        <span>吉林女子学校电子课件系统</span>
      </div>
    </footer>
  </div>
</template>