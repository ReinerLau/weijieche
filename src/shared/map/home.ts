import type { Marker } from 'maptalks'

export let entryPoint: Marker | null

export const setEntryPoint = (val: Marker | null) => {
  entryPoint = val
}
