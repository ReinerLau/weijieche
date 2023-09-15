import { ref, type Ref } from 'vue'
export const useResponsive = () => {
  const isMobile = ref(false)
  const mainRef: Ref<HTMLElement | undefined> = ref()
  function checkIsMobile() {
    if (screen.width < 1280) {
      isMobile.value = true
      if (mainRef.value) {
        mainRef.value.style.flexDirection = 'column'
      }
    } else {
      isMobile.value = false
      if (mainRef.value) {
        mainRef.value.style.flexDirection = 'row'
      }
    }
  }
  return {
    checkIsMobile,
    isMobile,
    mainRef
  }
}
