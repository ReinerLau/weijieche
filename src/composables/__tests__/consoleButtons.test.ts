import { describe, expect, it } from 'vitest'
import { useConsoleButton } from '../consoleButtons'

describe('中控台按下按钮', () => {
  it('按下第一个按钮', () => {
    const { onButtonDown } = useConsoleButton()

    const changedButton = onButtonDown(128)

    expect(changedButton).toEqual({
      index: 0,
      buttonStatus: 1
    })
  })

  it('按下第二个按钮', () => {
    const { onButtonDown } = useConsoleButton()

    const changedButton = onButtonDown(64)

    expect(changedButton).toEqual({
      index: 1,
      buttonStatus: 1
    })
  })

  it('松开第二个按钮', () => {
    const { onButtonDown } = useConsoleButton()

    onButtonDown(64)
    const changedButton = onButtonDown(0)

    expect(changedButton).toEqual({
      index: 1,
      buttonStatus: 0
    })
  })

  it('按下第三个按钮', () => {
    const { onButtonDown } = useConsoleButton()

    const changedButton = onButtonDown(32)

    expect(changedButton).toEqual({
      index: 2,
      buttonStatus: 1
    })
  })

  it('按下第四个按钮', () => {
    const { onButtonDown } = useConsoleButton()

    const changedButton = onButtonDown(16)

    expect(changedButton).toEqual({
      index: 3,
      buttonStatus: 1
    })
  })
})
