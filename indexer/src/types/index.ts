import { Log as ViemLog } from 'viem';

// Extend Log type to include args
export type Log = ViemLog & {
  args?: Record<string, any>;
};


