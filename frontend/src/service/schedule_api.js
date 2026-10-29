import axiosInstance from '../service/axiosInstance'


const SCHEDULE    = '/api/schedule/v1'
const TUTOR_SCHEUDLE = '/api/schedule/tutor/v1'
const BOOKED_SESSION = '/api/schedule/tutor/calendar/'



export async function createSchedule(data) {
  const response = await axiosInstance.post(`${SCHEDULE}/`, data)
  return response.data
}

export async function createAvailability(data) {
  const response = await axiosInstance.post(`${TUTOR_SCHEUDLE}/`, data, { timeout: 30000 })
  return response.data
}

export async function getAvailability() {
  const response = await axiosInstance.get(`${TUTOR_SCHEUDLE}/`, { timeout: 30000 })
  return response.data
}

export async function getBookedSessions() {
  const response = await axiosInstance.get(BOOKED_SESSION, { timeout: 30000 })
  return response.data
}