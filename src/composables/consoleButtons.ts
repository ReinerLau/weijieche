export enum BottomButton {
  MANUAL,
  STRONG_LIGHT,
  AMPLIFIER_OPEN,
  AMPLIFIER_CLOSE,
  VOICE,
  END_AUDIO,
  AUTO,
  PANTILT_RESET
}

export const useConsoleButton = () => {
  let oldButtonSet = new Array(8).fill('0')

  const onButtonDown = (newValue: number) => {
    const newButtonSet = newValue.toString(2).split('')
    for (let i = 0; i < 8 - newButtonSet.length; i++) {
      newButtonSet.unshift('0') // 左补 0
    }
    const changedButtonIndex = newButtonSet.findIndex((item, index) => item !== oldButtonSet[index])
    oldButtonSet = newButtonSet

    return {
      index: changedButtonIndex,
      buttonStatus: newButtonSet[changedButtonIndex]
    }
  }

  return {
    onButtonDown
  }
}
