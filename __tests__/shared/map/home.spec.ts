import { getHomePath, goHome } from '@/api/home'
import { currentCar, initMapLayerTool } from '@/shared'
import { map } from '@/shared/map/base'
import {
  clearDrawingHomePath,
  createHomePathToolbarEvent,
  homePathDrawEndEvent,
  homePathDrawLayer,
  homePathDrawendMenu,
  homePathDrawingMenu,
  homePathDrawingMenuEvent,
  homePathLayer,
  homePathPoints,
  homePaths,
  initHomePath,
  initHomePathLayer,
  startHomeToolbarEvent
} from '@/shared/map/home'
import { isRecord } from '@/shared/map/record'
import { flushPromises } from '@vue/test-utils'
import * as el from 'element-plus'
import { ConnectorLine, Marker } from 'maptalks'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('element-plus')

const elSpy = vi.spyOn(el, 'ElMessage')

vi.mock('@/api/home')

const testHomePathData = {
  data: {
    list: [
      {
        id: 1,
        enterGps: '{"x":-10.661796687091794,"y":25.978819904489796}',
        gps: '{"x":-10.663078602590645,"y":25.978527710485764}',
        mission:
          '[{"x":-10.661837708471381,"y":25.980317398760462},{"x":-10.66242739019205,"y":25.98033826976075},{"x":-10.662847858199342,"y":25.98030696326032},{"x":-10.66305296433356,"y":25.980145213008086}]'
      }
    ]
  }
}
describe('record', () => {
  beforeEach(() => {
    initMapLayerTool()
    initHomePathLayer()
  })

  it('返航路线图层', () => {
    expect(homePathLayer).not.toBeUndefined()
  })

  it('初始化所有返航路线', async () => {
    homePathLayer.clear()
    vi.mocked(getHomePath as any).mockImplementation(async () => testHomePathData)
    initHomePath()
    await flushPromises()
    expect(getHomePath).toHaveBeenCalled()
    expect(homePaths.value).toEqual(testHomePathData.data.list)
    expect(homePathLayer.getGeometries().length).toBe(2)
  })

  it('not data', async () => {
    vi.mocked(getHomePath as any).mockImplementation(async () => ({
      data: { list: undefined }
    }))
    initHomePath()
    await flushPromises()
    expect(homePaths.value).toEqual([])
  })

  it('新建返航路线', () => {
    isRecord.value = false
    createHomePathToolbarEvent()
    expect(homePathDrawLayer).not.toBeUndefined()
    expect(map.getMenuItems()).toEqual(homePathDrawingMenu)
  })

  it('homePathDrawEndEvent', () => {
    homePathPoints.length = 0
    const eMarker = { geometry: new Marker([113.1, 22.1]) }
    homePathDrawEndEvent(eMarker)
    expect(homePathDrawLayer.getGeometries()[0]).toBe(eMarker.geometry)
    expect(homePathPoints.length).toBe(1)
    const eMarker2 = { geometry: new Marker([113.4, 22.4]) }
    homePathDrawEndEvent(eMarker2)
    expect(homePathPoints.length).toBe(2)
    expect(homePathDrawLayer.getGeometries()[1]).toBe(eMarker2.geometry)
    expect(homePathDrawLayer.getGeometries()[2]).instanceOf(ConnectorLine)
  })

  describe('返航绘制右键菜单', () => {
    let testHomePathDrawingMenu: any
    beforeEach(() => {
      testHomePathDrawingMenu = homePathDrawingMenuEvent()
    })
    it('结束绘制', () => {
      testHomePathDrawingMenu[0].click()
      expect(map.getMenuItems()).toEqual(homePathDrawendMenu)
    })
  })

  it('开始执行返航', async () => {
    vi.mocked(goHome as any).mockImplementation(async () => {
      return {
        code: 500,
        data: null,
        message: ''
      }
    })
    currentCar.value = '003'
    isRecord.value = false
    startHomeToolbarEvent()
    expect(goHome).toHaveBeenCalled()
    await flushPromises()
    expect(elSpy).toHaveBeenCalledWith({
      type: 'success',
      message: ''
    })
  })

  it('清空当前正在创建的返航路线', () => {
    clearDrawingHomePath()
    expect(homePathPoints.length).toBe(0)
    expect(map.getLayer('home-line')).toBeNull()
    expect(map.getMenuItems()).toEqual([])
  })
})
