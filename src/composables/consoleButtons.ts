export enum BottomButtons {
  MANUAL,
  STRONG_LIGHT,
  AMPLIFIER_OPEN,
  AMPLIFIER_CLOSE,
  VOICE,
  END_AUDIO,
  AUTO,
  PANTILT_RESET
}

export enum TopButtons {
  AUDIO_1 = 2,
  AUDIO_2 = 3
}

export const useConsoleButton = () => {
  let oldValue = 0
  let oldButtonSet = new Array(8).fill('0')

  const onButtonDown = (newValue: number) => {
    if (newValue !== oldValue) {
      oldValue = newValue
      const newButtonSet = newValue.toString(2).split('')
      const newLength = newButtonSet.length
      if (newButtonSet.length < 8) {
        for (let i = 0; i < 8 - newLength; i++) {
          newButtonSet.unshift('0') // 左补 0
        }
      }
      const changedButtonIndex = newButtonSet.findIndex(
        (item, index) => item !== oldButtonSet[index]
      )
      oldButtonSet = newButtonSet

      return {
        index: changedButtonIndex,
        buttonStatus: parseInt(newButtonSet[changedButtonIndex])
      }
    }
  }

  return {
    onButtonDown
  }
}
