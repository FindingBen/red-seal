import axiosInstance from './axiosInstance.js'

const PACKAGES = "/api/payments/packages/"

export async function getPackages() {
  const response = await axiosInstance.get(PACKAGES)
  return response.data
}

export async function createCheckoutSession(packageId) {
  const response = await axiosInstance.post('/api/payments/checkout/', {
    package_id: packageId,
  })
  return response.data
}
