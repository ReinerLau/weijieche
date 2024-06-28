import { describe, expect, it } from 'vitest'
import { useConsoleButton } from '../consoleButtons'

describe('中控台按下按钮', () => {
  it('按下强光按钮', () => {
    const { onButtonDown } = useConsoleButton()

    const changedButton = onButtonDown(64)

    expect(changedButton).toEqual({
      index: 1,
      buttonStatus: '1'
    })
  })

  it('松开强光按钮', () => {
    const { onButtonDown } = useConsoleButton()

    onButtonDown(64)
    const changedButton = onButtonDown(0)

    expect(changedButton).toEqual({
      index: 1,
      buttonStatus: '0'
    })
  })
})
