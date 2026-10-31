import axiosInstance from '../service/axiosInstance'


const CLASSES    = '/api/accounts/tutors/'
const ME = '/api/accounts/me/'
const WALLET = '/api/accounts/wallet/'
const STUDENTS = '/api/accounts/students/'
const INVATATION = '/api/accounts/invitations/'
const REGISTERATION = '/api/accounts/register/'


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

export async function sendInvatation(){
    const response = await axiosInstance.post(INVATATION)
    return response.data
}

export async function userRegister(data){
    const response = await axiosInstance.post(REGISTERATION,data)
    return response.data
}