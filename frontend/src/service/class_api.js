import axiosInstance from '../service/axiosInstance'


const CLASSES    = '/api/classes/v1/'
const BOOKED = '/api/classes/tutor/v1/'


export async function getClasses() {
  const response = await axiosInstance.get(`${CLASSES}`)
  return response.data
}

export async function getClassById(classId) {
  const response = await axiosInstance.get(`${CLASSES}${encodeURIComponent(classId)}/`)
  return response.data
}

export async function getClassContent(classId) {
  const response = await axiosInstance.get(`${CLASSES}${encodeURIComponent(classId)}/content/`)
  return response.data
}

export async function updateClassContent(classId, notes) {
  const response = await axiosInstance.put(`${CLASSES}${encodeURIComponent(classId)}/content/`, {
    class_content: { notes },
  })
  return response.data
}

export async function getBookedClasses(){
  const response = await axiosInstance.get(BOOKED)
  return response.data
}