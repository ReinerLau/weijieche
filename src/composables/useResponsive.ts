import { ref, type Ref } from 'vue'

// 响应式相关
export const useResponsive = () => {
  // 当前是否处于移动端模式
  const isMobile = ref(false)
  // 目前没用
  const mainRef: Ref<HTMLElement | undefined> = ref()
  // 校验是否处于移动端模式
  function checkIsMobile() {
    if (innerWidth < 1000 || innerHeight < 520) {
      isMobile.value = true
      // if (mainRef.value) {
      //   mainRef.value.style.flexDirection = 'column'
      // }
    } else {
      isMobile.value = false
      // if (mainRef.value) {
      //   mainRef.value.style.flexDirection = 'row'
      // }
    }
  }
  return {
    checkIsMobile,
    isMobile,
    mainRef
  }
}
