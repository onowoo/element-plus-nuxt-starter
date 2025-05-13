<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
    <header class="h-16 flex items-center justify-between px-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <img src="/favicon.png" alt="Logo" class="h-8 w-8" >
        <span class="text-lg font-semibold text-gray-800 dark:text-white">吉林女子学校</span>
      </div>
      <UiDarkToggle />
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>