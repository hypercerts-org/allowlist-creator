"use client";

import {Separator} from "@/components/ui/separator";
import {z} from "zod";
import {useToast} from "@/components/ui/use-toast";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import {AllowlistEntry} from "@hypercerts-org/sdk";
import {Form} from "@/components/ui/form";
import {DataTable} from "@/components/DataTable";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {validateAllowlist} from "@hypercerts-org/sdk";
import {isAddress, parseEther} from "viem";
import {ColumnDef} from "@tanstack/react-table";

const fetchAllowListSchema = z.object({
    allowListUrl: z.string().url(),
});

type FetchAllowListFormValues = z.infer<typeof fetchAllowListSchema>;

const defaults: FetchAllowListFormValues = {
    allowListUrl: "ipfs://examplendasioundixcasjknxc892g3843brfcom",
}
type ValidationResult =
    {
        data: AllowlistEntry[] | unknown,
        valid: boolean,
        errors: Record<string, string | string[]>
    }

export default function Home() {
    const {toast} = useToast();
    const [merkleTree, setMerkleTree] = useState<StandardMerkleTree<[string, bigint]> | undefined>(undefined);
    const [allowList, setAllowList] = useState<AllowlistEntry[] | undefined>(undefined);
    const [validationResult, setValidationResult] = useState<ValidationResult | undefined>(undefined);
    const [errors, setErrors] = useState<string[]>([]);
    const form = useForm<FetchAllowListFormValues>({
        resolver: zodResolver(fetchAllowListSchema),
        defaultValues: defaults,
        mode: "onChange",
    });

    console.log(validationResult)

    useEffect(() => {
        const validationResult = allowList ? validateAllowlist(allowList, parseEther("1")) : undefined;

        if (validationResult && !validationResult.valid) {
            const entries = Object.entries(validationResult.errors);

            if (Array.isArray(entries)) {
                const flattened = entries.flatMap(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.map((v) => `${key}: ${v}`);
                    }
                    return `${key}: ${value}`;
                });

                setErrors(flattened);
            }
        }

        setValidationResult(validationResult);
    }, [allowList]);

    useEffect(() => {
        const entries: AllowlistEntry[] = [];
        if (!merkleTree) {
            return;
        }

        for (const [i, v] of merkleTree.entries()) {
            const address = v[0];
            const units = v[1];

            if (!address || !units) {
                setErrors([...errors, `Invalid allow list: entry ${i} is missing address or units`]);
                continue;
            }

            if (!isAddress(address)) {
                setErrors([...errors, `Invalid allow list: entry ${i} has an invalid address`]);
                continue;
            }

            if (units <= 0) {
                setErrors([...errors, `Invalid allow list: entry ${i} has an invalid number of units`]);
                continue;
            }

            entries.push({address, units});
        }

        setAllowList(entries);

    }, [merkleTree]);

    const onSubmit = async (values: FetchAllowListFormValues) => {
        try {
            // fetch allow list
            const response = await fetch(values.allowListUrl);
            const data = await response.json();

            let tree: StandardMerkleTree<[string, bigint]>
            try {
                tree = StandardMerkleTree.load(JSON.parse(data));
                setMerkleTree(tree);
            } catch (e) {
                setErrors([...errors, `Invalid allow list: could not build Merkle tree`]);
            }
        } catch (e) {
            toast({
                title: "Error fetching allow list",
                description: "Review console for more information",
            });
            console.log(e)
        }
    }

    const columns: ColumnDef<AllowlistEntry>[] = [
        {
            accessorKey: "address",
            header: "Address",
        },
        {
            accessorKey: "units",
            header: "Units",
        },
    ]


    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24 space-y-4">
            <h1 className="text-xl uppercase">Inspect allow list</h1>
            <div className={"space-y-4 max-w-xl"}>
                <section className={"space-y-4"}>
                    <h2 className="text-lg font-bold">Instructions</h2>
                    <p>
                        Provide a link to an allow list that&apos;s publicly available (e.g. IPFS or a server). This
                        page
                        will render and verify the allow list.
                    </p>


                </section>
                <Separator/>
            </div>
            <div className={"min-w-max"}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-4 min-w-max"}>
                        <Label>
                            <span>Allow list URL</span>
                        </Label>
                        <Input type="text" className={"min-w-max"} {...form.register("allowListUrl")}/>
                        <Button type={"submit"} className={"bg-blue-400 hover:bg-blue-500"}>Fetch allow list</Button>
                    </form>
                </Form>
            </div>

            <Separator/>
            {errors.length > 0 && (
                <div className={"space-y-4"}>
                    {errors.map((error, index) => (
                        <div key={index} className={"bg-red-200 p-4"}>
                            {error}
                        </div>
                    ))}
                </div>
            )}
            {validationResult && validationResult.valid && (
                <div className={"flex flex-row space-x-4"}>
                    <div className={"bg-green-200 p-4"}>
                        Allow list is valid
                    </div>
                    <div className={"bg-green-200 p-4"}>
                        Total units: {allowList?.reduce((acc, curr) => acc + BigInt(curr.units), 0n).toString()}
                    </div>
                    <div className={"bg-green-200 p-4"}>
                        Total records: {allowList?.length}
                    </div>
                </div>
            )}
            {allowList && (
                <DataTable columns={columns} data={allowList}/>
            )}
        </main>
    );
}
