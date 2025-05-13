<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

const router = useRouter()
const selectedCourse = ref('')
const studentName = ref('')

// Replace the hardcoded courses with dynamic loading
const { data: questionBank } = await useFetch('/api/questions')
const courses = computed(() => {
  return questionBank.value?.subjects.flatMap((subject: { courses: unknown[]; name: unknown }) => 
    subject.courses.map(course => ({
      label: `${subject.name} - ${(course as { title: string }).title}`,
      value: (course as { id: string | number }).id
    }))
  ) || []
})

const handleSubmit = () => {
  if (!selectedCourse.value) {
    ElMessage.error('请选择课件项目')
    return
  }
  if (!studentName.value.trim()) {
    ElMessage.error('请输入姓名')
    return
  }
  
  router.push(`/quiz?course=${selectedCourse.value}&name=${encodeURIComponent(studentName.value)}`)
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300">
      <div class="p-8 text-center">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">欢迎使用课件系统</h1>
        
        <div class="mb-6">
          <el-select 
            v-model="selectedCourse"
            placeholder="请选择课件项目"
            class="w-full"
          >
            <el-option
              v-for="item in courses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        
        <div class="mb-6">
          <el-input
            v-model="studentName"
            placeholder="请输入您的姓名"
            class="w-full"
          />
        </div>
        
        <el-button 
          type="primary" 
          class="w-full py-3 text-base"
          @click="handleSubmit"
        >
          开始学习
        </el-button>
      </div>
    </div>
  </div>
</template>
