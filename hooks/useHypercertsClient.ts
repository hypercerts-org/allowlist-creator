import {HypercertClient} from "@hypercerts-org/sdk";

export const useHypercertsClient = () => {
    const client = new HypercertClient({chain: {id: 11155111}});

    return {client}
}