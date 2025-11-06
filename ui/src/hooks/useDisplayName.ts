import { useState, useEffect } from 'react'

const DISPLAY_NAMES_KEY = 'chainequity_display_names'

// Get all display names from localStorage
const getDisplayNames = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(DISPLAY_NAMES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Save display names to localStorage
const saveDisplayNames = (names: Record<string, string>) => {
  try {
    localStorage.setItem(DISPLAY_NAMES_KEY, JSON.stringify(names))
  } catch (error) {
    console.error('Failed to save display names:', error)
  }
}

// Default names for known wallets
const DEFAULT_NAMES: Record<string, string> = {
  '0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6': 'Admin',
  '0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e': 'Investor A',
  '0xefd94a1534959e04630899abdd5d768601f4af5b': 'Investor B',
  '0xaf8dc13099b9b0a97a3629ba03538de5270ecf75': 'Investor C',
  '0x6264f29968e8fd2810cb79fb806ac65daf9db73d': 'Gnosis Safe',
}

export function useDisplayName(address?: string) {
  const [displayName, setDisplayName] = useState<string>('')

  useEffect(() => {
    if (!address) {
      setDisplayName('')
      return
    }

    const normalizedAddress = address.toLowerCase()
    const storedNames = getDisplayNames()
    
    // Priority: localStorage > defaults > Unknown Wallet
    const name = storedNames[normalizedAddress] || 
                 DEFAULT_NAMES[normalizedAddress] || 
                 'Unknown Wallet'
    
    setDisplayName(name)
  }, [address])

  const updateDisplayName = (newName: string) => {
    if (!address) return

    const normalizedAddress = address.toLowerCase()
    const storedNames = getDisplayNames()
    
    if (newName.trim()) {
      storedNames[normalizedAddress] = newName.trim()
    } else {
      delete storedNames[normalizedAddress]
    }
    
    saveDisplayNames(storedNames)
    setDisplayName(newName.trim() || DEFAULT_NAMES[normalizedAddress] || 'Unknown Wallet')
  }

  return { displayName, updateDisplayName }
}

// Utility function to get display name for any address (for cap table)
export function getDisplayName(address: string): string {
  const normalizedAddress = address.toLowerCase()
  const storedNames = getDisplayNames()
  
  return storedNames[normalizedAddress] || 
         DEFAULT_NAMES[normalizedAddress] || 
         'Unknown Wallet'
}

