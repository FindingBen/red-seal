import axiosInstance from '../service/axiosInstance'


const CLASSES    = '/api/accounts/tutors/'
const ME = '/api/accounts/me/'


export async function getTutors(){
    const response = await axiosInstance.get(CLASSES)
    return response.data
}

export async function getMe(){
    const response = await axiosInstance.get(ME)
    return response.data
}