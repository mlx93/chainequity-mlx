import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { executeStockSplit, updateSymbol } from '@/lib/api'
import { toast } from 'sonner'
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, GatedTokenABI } from '@/config/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const splitSchema = z.object({
  multiplier: z.number().min(2, 'Multiplier must be at least 2'),
})

const symbolSchema = z.object({
  newSymbol: z.string().min(2).max(6).regex(/^[A-Z0-9]+$/, 'Symbol must be 2-6 uppercase alphanumeric characters'),
})

type SplitFormData = z.infer<typeof splitSchema>
type SymbolFormData = z.infer<typeof symbolSchema>

export default function CorporateActions() {
  const [splitLoading, setSplitLoading] = useState(false)
  const [symbolLoading, setSymbolLoading] = useState(false)

  const { data: currentSymbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'symbol',
  })

  const {
    register: registerSplit,
    handleSubmit: handleSplitSubmit,
    formState: { errors: splitErrors },
    reset: resetSplit,
  } = useForm<SplitFormData>({
    resolver: zodResolver(splitSchema),
  })

  const {
    register: registerSymbol,
    handleSubmit: handleSymbolSubmit,
    formState: { errors: symbolErrors },
    reset: resetSymbol,
  } = useForm<SymbolFormData>({
    resolver: zodResolver(symbolSchema),
  })

  const onSplitSubmit = async (data: SplitFormData) => {
    setSplitLoading(true)
    try {
      const result = await executeStockSplit(data.multiplier)
      toast.success('Stock split executed', {
        description: `All balances multiplied by ${data.multiplier}`,
        action: {
          label: 'View',
          onClick: () => window.open(result.blockExplorerUrl, '_blank'),
        },
      })
      resetSplit()
    } catch (error) {
      toast.error('Failed to execute stock split', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSplitLoading(false)
    }
  }

  const onSymbolSubmit = async (data: SymbolFormData) => {
    setSymbolLoading(true)
    try {
      const result = await updateSymbol(data.newSymbol.toUpperCase())
      toast.success('Symbol updated', {
        description: `Symbol changed to ${data.newSymbol.toUpperCase()}`,
        action: {
          label: 'View',
          onClick: () => window.open(result.blockExplorerUrl, '_blank'),
        },
      })
      resetSymbol()
    } catch (error) {
      toast.error('Failed to update symbol', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSymbolLoading(false)
    }
  }

  return (
    <Tabs defaultValue="split" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-9">
        <TabsTrigger value="split" className="text-xs">Stock Split</TabsTrigger>
        <TabsTrigger value="symbol" className="text-xs">Change Symbol</TabsTrigger>
      </TabsList>
      <TabsContent value="split" className="space-y-3 mt-3">
        <form onSubmit={handleSplitSubmit(onSplitSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="multiplier" className="text-xs">Multiplier</Label>
            <Input
              id="multiplier"
              type="number"
              step="1"
              min="2"
              {...registerSplit('multiplier', { valueAsNumber: true })}
              placeholder="7"
              className="h-9 text-sm"
            />
            {splitErrors.multiplier && (
              <p className="text-xs text-destructive">{splitErrors.multiplier.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              All token balances will be multiplied by this factor
            </p>
          </div>
          <Button type="submit" disabled={splitLoading} className="w-full h-9 text-sm">
            {splitLoading ? 'Executing...' : 'Execute Stock Split'}
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="symbol" className="space-y-3 mt-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Current: <span className="font-mono font-semibold">{currentSymbol as string || 'Loading...'}</span>
          </p>
        </div>
        <form onSubmit={handleSymbolSubmit(onSymbolSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="newSymbol" className="text-xs">New Symbol</Label>
            <Input
              id="newSymbol"
              {...registerSymbol('newSymbol')}
              placeholder="CHAINEQUITY-B"
              className="uppercase h-9 text-sm"
            />
            {symbolErrors.newSymbol && (
              <p className="text-xs text-destructive">{symbolErrors.newSymbol.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              2-6 uppercase characters
            </p>
          </div>
          <Button type="submit" disabled={symbolLoading} className="w-full h-9 text-sm">
            {symbolLoading ? 'Updating...' : 'Change Symbol'}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}

