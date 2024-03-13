import { DrawTool } from 'maptalks'
import { map } from './base'

/**
 * 绘制工具实例
 */
export let drawTool: DrawTool

/**
 * 初始化绘制工具
 */
export const initDrawTool = () => {
  drawTool = new DrawTool({ mode: 'Point' })
  drawTool.addTo(map).disable()
}
