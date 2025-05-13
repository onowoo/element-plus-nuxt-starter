<script setup lang="ts">
const route = useRoute()
const courseId = ref(route.query.course as string)
const studentName = ref(decodeURIComponent(route.query.name as string))
const currentQuestionIndex = ref(0)
const showHint = ref(false)

// 添加selectedAnswer的定义
const selectedAnswer = ref<number | null>(null)

// 定义接口
interface Question {
  question: string
  images: string[]
  selected: number | null
  answer: number
  hint: string
}

interface Course {
  id: string
  title: string
  questions: Question[]
}

interface Subject {
  subjects: {
    courses: Course[]
  }[]
}

// 加载题库数据
const { data: questionBank } = await useFetch<Subject>('/api/questions')

// 使用ref管理当前课程数据
const currentCourseData = ref<Course | null>(null)

// 监听questionBank变化，更新currentCourseData
watch(() => questionBank.value, (newVal) => {
  if (newVal?.subjects) {
    const course = newVal.subjects
      .flatMap((subject) => subject.courses)
      .find((course) => course.id === courseId.value)
    if (course) {
      // 重置所有题目的selected为null
      course.questions.forEach(q => { q.selected = null })
    }
    currentCourseData.value = course || null
  }
}, { immediate: true })

// 当前问题 - 修复计算属性中的副作用问题
const currentQuestion = computed<Question | null>(() => {
  const questions = currentCourseData.value?.questions || []
  const question = questions[currentQuestionIndex.value]
  return question || null
})

// 添加watch来处理选中状态的同步
watch(currentQuestion, (newQuestion) => {
  if (newQuestion) {
    selectedAnswer.value = newQuestion.selected
  } else {
    selectedAnswer.value = null
  }
}, { immediate: true })

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === (currentCourseData.value?.questions?.length || 0) - 1
})

// 处理选择答案（只记录临时选择，不直接写入题目）
const handleSelect = (index: number) => {
  selectedAnswer.value = index
}

// 下一题按钮逻辑，只有在点击按钮时才写入题目
const handleNext = () => {
  if (selectedAnswer.value === null) {
    ElMessage.error('请选择答案')
    return
  }

  // 记录用户选择
  const currentQuestions = currentCourseData.value?.questions
  const currentIndex = currentQuestionIndex.value
  if (currentQuestions?.[currentIndex]) {
    currentQuestions[currentIndex].selected = selectedAnswer.value

    // 判断答对/答错并提示
    if (selectedAnswer.value === currentQuestions[currentIndex].answer) {
      ElMessage.success('答对了！')
    } else {
      ElMessage.error('答错了！')
    }
  }

  showHint.value = true

  if (!isLastQuestion.value) {
    setTimeout(() => {
      currentQuestionIndex.value++
      selectedAnswer.value = currentCourseData.value?.questions?.[currentQuestionIndex.value]?.selected ?? null
      showHint.value = false
    }, 1000)
  } else {
    submitAnswers()
  }
}

// 计算得分（只有答对且已提交的题才计分）
const calculateScore = () => {
  const SCORE_PER_QUESTION = 4
  return currentCourseData.value?.questions?.reduce((score: number, q: Question) => {
    return q.selected !== null && q.selected === q.answer ? score + SCORE_PER_QUESTION : score
  }, 0) || 0
}

// 计算已答题数（只统计已提交的题）
const answeredCount = computed(() => {
  return currentCourseData.value?.questions?.filter(q => q.selected !== null).length || 0
})

const showRank = ref(false)
const rankList = ref<{ name: string, score: number }[]>([])

const fetchRank = async () => {
  const res = await $fetch('/api/rank', {
    method: 'GET',
    params: { course: courseId.value }
  })
  rankList.value = res.rank || []
}

const submitAnswers = async () => {
  const score = calculateScore()
  try {
    await $fetch('/api/submit', {
      method: 'POST',
      body: {
        course: courseId.value,
        name: studentName.value,
        score
      }
    })
    ElMessage.success('提交成功')
    await fetchRank()
    showRank.value = true
  } catch (error) {
    ElMessage.error('提交失败')
    console.error(error)
  }
}
// 移除 vue-typed-js 的 import

// 打字机效果相关
const typingText = ref('')
const typingIndex = ref(0)
// 这里将类型声明为 ReturnType<typeof setInterval> | null
const typingTimer = ref<ReturnType<typeof setInterval> | null>(null)

// 监听题目变化，触发打字机动画
watch(currentQuestion, (newQuestion) => {
  if (newQuestion) {
    typingText.value = ''
    typingIndex.value = 0
    if (typingTimer.value) {
      clearInterval(typingTimer.value)
    }
    const fullText = newQuestion.question
    typingTimer.value = setInterval(() => {
      if (typingIndex.value < fullText.length) {
        typingText.value += fullText[typingIndex.value]
        typingIndex.value++
      } else {
        if (typingTimer.value) clearInterval(typingTimer.value)
      }
    }, 80) // 速度可调
  } else {
    typingText.value = ''
    typingIndex.value = 0
    if (typingTimer.value) clearInterval(typingTimer.value)
  }
}, { immediate: true })

onUnmounted(() => {
  if (typingTimer.value) clearInterval(typingTimer.value)
})
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">
      {{ studentName }}的{{ currentCourseData?.title }}测试
    </h1>
    <div v-if="showRank">
      <div class="mb-6 text-xl font-bold text-center">排行榜</div>
      <el-table :data="rankList" style="width: 100%">
        <el-table-column prop="index" label="排名" width="60" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="score" label="分数" />
      </el-table>
      <el-button class="mt-6 w-full" type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
    <div v-else>
      <div class="mb-4 p-4 bg-gray-50 shadow dark:bg-gray-800 rounded-lg">
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-lg font-medium text-gray-600 dark:text-gray-300">已答题数</div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ answeredCount }}/{{ currentCourseData?.questions?.length || 0 }}</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-medium text-gray-600 dark:text-gray-300">当前得分</div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ calculateScore() }}分</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-medium text-gray-600 dark:text-gray-300">总分</div>
            <div class="text-2xl font-bold text-gray-600 dark:text-gray-300">{{ (currentCourseData?.questions?.length || 0) * 4 }}分</div>
          </div>
        </div>
      </div>
      <div v-if="currentQuestion" class="mb-8">
        <h3 class="text-lg font-medium mb-4">
          第{{ currentQuestionIndex + 1 }}题: {{ typingText }}
          <span v-if="typingText.length < (currentQuestion?.question.length || 0)" class="animate-pulse">|</span>
        </h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div 
            v-for="(img, index) in currentQuestion.images" 
            :key="index"
            :class="{
              'border-4 border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02] transition-transform': selectedAnswer === index,
              'border-2 border-gray-200 hover:border-blue-300': selectedAnswer !== index
            }"
            class="cursor-pointer transition-all duration-200 rounded-lg overflow-hidden relative aspect-[9/16]"
            @click="handleSelect(index)"
          >
            <img 
              :src="img" 
              class="w-full h-full object-cover"
            >
            <div 
              class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center font-medium transition-colors"
              :class="{
                'bg-blue-500 text-white': selectedAnswer === index,
                'bg-gray-200 text-gray-700': selectedAnswer !== index
              }"
            >
              {{ ['A','B'][index] }}
            </div>
          </div>
        </div>
        <!-- <div v-if="showHint" class="p-4 bg-gray-100 dark:bg-gray-800 rounded mb-4">
          {{ currentQuestion.hint }}
        </div> -->
        <el-button 
          type="primary" 
          class="w-full"
          :disabled="selectedAnswer === null"
          @click="handleNext"
        >
          {{ isLastQuestion ? '提交答案' : '下一题' }}
        </el-button>
      </div>
    </div>
  </div>
</template>