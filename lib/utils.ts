import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {parseEther} from "viem";

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

export const getPercentage = (value: bigint | number, total: bigint, decimals = 2) => {
    return BigInt(BigInt(value) * 100n / total).toString()
}

export const getPercentageAsEthWei = (percentage: string) => {
    return (BigInt(percentage) * parseEther("1")) / 100n
}

export const mapValueToFraction = (value: bigint, total: bigint) => {
    return getPercentageAsEthWei(getPercentage(value, total));
}