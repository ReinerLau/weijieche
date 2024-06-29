import { describe, expect, it, vi } from 'vitest'
import { useCarDialog } from '../useCarDialog'
import { useCarSelector } from '../useCarSelector'

describe('选择车辆弹窗', () => {
  vi.mock('@/business/afterChangeCar', () => ({
    default: vi.fn()
  }))

  it('主页加载后弹出选择弹窗', () => {
    const { visible } = useCarDialog()

    expect(visible.value).toBe(true)
  })

  it('已选择车辆点击确定关闭弹窗', () => {
    const { visible, confirmIt } = useCarDialog()
    const { changeCar } = useCarSelector()

    changeCar('123')
    confirmIt()

    expect(visible.value).toBe(false)
  })

  it('未选择车辆点击确定不能关闭弹窗', () => {
    const { visible, confirmIt } = useCarDialog()

    confirmIt()

    expect(visible.value).toBe(true)
  })
})
