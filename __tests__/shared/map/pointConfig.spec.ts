import { pathPointsData } from '@/shared/map/path'
import { handleConfirmPointCarConfig } from '@/shared/map/pointConfig'
import * as el from 'element-plus'
import { describe, expect, it, vi } from 'vitest'

vi.mock('element-plus')

const elSpy = vi.spyOn(el, 'ElMessage')

describe('设置速度', () => {
  it('handleConfirmPointCarConfig', () => {
    pathPointsData.value.length = 0
    handleConfirmPointCarConfig(10)
    expect(elSpy).toHaveBeenCalled()
  })
})
