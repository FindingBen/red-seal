import axiosInstance from '../service/axiosInstance'


const CLASSES    = '/api/classes/v1/'



export async function getClasses() {
  const response = await axiosInstance.get(`${CLASSES}`)
  return response.data
}