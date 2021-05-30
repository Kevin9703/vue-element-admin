import request from '@/utils/request'

const baseURL = '/manager'
export function getRoomList() {
  return request({
    url: `${baseURL}/getReviewRoom`,
    method: 'get'
  })
}

export function passReview(id) {
  return request({
    url: `${baseURL}/passReview`,
    method: 'get',
    params: { rId: id }
  })
}

export function failReview(params) {
  return request({
    url: `${baseURL}/failReview`,
    method: 'get',
    params: params
  })
}

export function getRoomDetail(id) {
  return request({
    url: `${baseURL}/getReviewRoomDetail`,
    method: 'get',
    params: { rId: id }
  })
}

