import { initMapLayerTool } from '@/shared'
import { alarmMarkerLayer, initAlarmMarkerLayer } from '@/shared/map/alarm'
import { beforeEach, describe, expect, it } from 'vitest'

describe('警报', () => {
  beforeEach(() => {
    initMapLayerTool()
    initAlarmMarkerLayer()
  })
  it('新增警报图层', () => {
    expect(alarmMarkerLayer).not.toBeUndefined()
  })
})
