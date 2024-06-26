/// <reference path="../../node_modules/@types/w3c-web-serial/index.d.ts"/>
export interface TemplateData {
  id: number
  mission: string
}

export interface Coordinate {
  /**
   * 纬度
   */
  x: number
  /**
   * 经度
   */
  y: number
}

export interface PointData extends Coordinate {
  speed: number
}
