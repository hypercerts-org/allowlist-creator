import {useHypercertsClient} from "@/hooks/useHypercertsClient";
import {AllowListCreateFormValues} from "@/components/CreateAllowListForm";
import {parseEther} from "viem";
import {AllowlistEntry, validateAllowlist} from "@hypercerts-org/sdk";

export const useUploadAllowList = () => {
    const {client} = useHypercertsClient();

    const uploadAllowList = async (allowList: AllowlistEntry[], totalUnits: bigint) => {

        const validationResult = validateAllowlist(allowList, totalUnits);

        if (!validationResult.valid) {
            console.log(validationResult);
            return validationResult;
        }


        return {
            cid: await client.storage.storeAllowList(allowList, totalUnits),
            ...validationResult
        }
    }

    return {uploadAllowList};
}