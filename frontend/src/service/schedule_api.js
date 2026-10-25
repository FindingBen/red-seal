import axiosInstance from '../service/axiosInstance'


const SCHEDULE    = '/api/schedule/v1'



export async function createSchedule(data) {
  const response = await axiosInstance.post(`${SCHEDULE}/`, data)
  return response.data
}