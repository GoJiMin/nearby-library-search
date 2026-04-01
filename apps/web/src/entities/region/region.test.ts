import { describe, expect, it } from 'vitest'
import {
  DETAIL_REGION_OPTIONS_BY_REGION,
  isDetailRegionOfRegion,
} from '@/entities/region'

describe('entities/region', () => {
  it('isDetailRegionOfRegion는 선택한 region에 속하는 detailRegion만 true를 반환한다', () => {
    expect(isDetailRegionOfRegion('11', '11010')).toBe(true)
    expect(isDetailRegionOfRegion('11', '21010')).toBe(false)
    expect(isDetailRegionOfRegion('11', undefined)).toBe(false)
  })

  it('DETAIL_REGION_OPTIONS_BY_REGION의 모든 항목은 자신의 상위 region과 일치한다', () => {
    Object.entries(DETAIL_REGION_OPTIONS_BY_REGION).forEach(
      ([region, detailRegions]) => {
        detailRegions.forEach((detailRegion) => {
          expect(detailRegion.region).toBe(region)
          expect(detailRegion.code.startsWith(region)).toBe(true)
        })
      }
    )
  })
})
