import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const assertExists = (value: any, messageToThrow?: string) => {
  if (value !== undefined && value !== null) {
    return value;
  } else {
    throw new Error(
        messageToThrow || "assertExists: The passed value doesn’t exist"
    );
  }
};

export const getPercentage = (value: bigint, total: bigint, decimals = 2) => {
    if(total === 0n) return (0).toFixed(decimals);


}