import { useGamepad } from '@vueuse/core'
import { ref, type Ref } from 'vue'

export const useController = () => {
  const controllers: Ref<string[]> = ref([])

  getAxes()

  function getAxes() {
    const { gamepads } = useGamepad()
    controllers.value = gamepads.value.map((item) => item.id)
    // if (gamepads.value[0]) {
    //   console.log(gamepads.value[0].axes)
    // }
    requestAnimationFrame(getAxes)
  }

  //   const controllers = computed(() => {})
  return {
    controllers
  }
}
