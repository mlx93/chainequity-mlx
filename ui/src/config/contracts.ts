import GatedTokenABI from '../abis/GatedToken.json'

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xFCc9E74019a2be5808d63A941a84dEbE0fC39964'
export const SAFE_ADDRESS = import.meta.env.VITE_SAFE_ADDRESS || '0x6264F29968e8fd2810cB79fb806aC65dAf9db73d'

export const ADMIN_ADDRESSES = [
  '0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6', // Admin wallet
  '0x6264F29968e8fd2810cB79fb806aC65dAf9db73d', // Safe address
]

export { GatedTokenABI }

