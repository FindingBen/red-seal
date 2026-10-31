import axiosInstance from '../service/axiosInstance'


const CLASSES    = '/api/accounts/tutors/'
const ME = '/api/accounts/me/'
const WALLET = '/api/accounts/wallet/'
const STUDENTS = '/api/accounts/students/'


export async function getTutors(){
    const response = await axiosInstance.get(CLASSES)
    return response.data
}

export async function getStudents(){
    const response = await axiosInstance.get(STUDENTS)
    return response.data
}

export async function getMe(){
    const response = await axiosInstance.get(ME)
    return response.data
}

export async function getWallet(){
    const response = await axiosInstance.get(WALLET)
    return response.data
}