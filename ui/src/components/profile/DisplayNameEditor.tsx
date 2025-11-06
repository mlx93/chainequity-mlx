import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useDisplayName } from '@/hooks/useDisplayName'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'

export default function DisplayNameEditor() {
  const { address } = useAccount()
  const { displayName, updateDisplayName } = useDisplayName(address)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const startEditing = () => {
    setEditValue(displayName)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const saveDisplayName = () => {
    if (editValue.trim().length === 0) {
      toast.error('Display name cannot be empty', { duration: 3000 })
      return
    }

    if (editValue.trim().length > 50) {
      toast.error('Display name must be 50 characters or less', { duration: 3000 })
      return
    }

    updateDisplayName(editValue.trim())
    setIsEditing(false)
    toast.success('Display name updated', { 
      description: `Now showing as "${editValue.trim()}" in cap table`,
      duration: 4000 
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveDisplayName()
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  if (!address) return null

  return (
    <div className="flex items-center gap-2">
      {!isEditing ? (
        <>
          <span className="text-3xl font-bold">{displayName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={startEditing}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter display name"
            className="h-10 text-lg font-bold max-w-xs"
            autoFocus
          />
          <Button
            variant="default"
            size="sm"
            onClick={saveDisplayName}
            className="h-10 w-10 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelEditing}
            className="h-10 w-10 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}

