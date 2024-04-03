"use client"

import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import {AllowlistEntry} from "@hypercerts-org/sdk";
import {useUploadAllowList} from "@/hooks/useUploadAllowlist";
import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table"
import {DataTable} from "@/components/DataTable";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {mapValueToFraction} from "@/lib/utils";

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


export const AllowListTable = ({allowList}: { allowList: AllowlistEntry[] }) => {
    const {toast} = useToast();
    const {uploadAllowList} = useUploadAllowList();
    const [allowListCID, setAllowListCID] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    if (!allowList) {
        return (<Alert className={"m-4 bg-red-300 max-w-lg"}>
            <AlertTitle>Empty!</AlertTitle>
            <AlertDescription>
                No data to display
            </AlertDescription>
        </Alert>);
    }


    const onSubmit = async (values: AllowlistEntry[]) => {
        try {
            setLoading(true);

            const totalPoints = values.reduce((acc, curr) => acc + BigInt(curr.units), 0n);
            const totalUnits = allowList.map((entry) => {
                return mapValueToFraction(BigInt(entry.units), totalPoints)
            });

            // make sure total units add up to 10 ** 18 (1 ether) and add rounding error to last entry
            const totalUnitsSum = totalUnits.reduce((acc, curr) => acc + curr, 0n);
            const roundingError = 10n ** 18n - totalUnitsSum;
            totalUnits[totalUnits.length - 1] += roundingError;

            const parsedAllowList = values.map((entry, index) => {
                return {
                    address: entry.address,
                    units: totalUnits[index]
                }
            })

            if (totalUnits.reduce((acc, curr) => acc + curr, 0n) !== 10n ** 18n) {
                toast({
                    title: "Error",
                    description: "Total units do not add up to 1 ether"
                })
                return;
            }


            const res = await uploadAllowList(parsedAllowList, totalUnits.reduce((acc, curr) => acc + curr, 0n));

            // TODO better typing check if res has CID
            //@ts-ignore
            if (!res?.cid) {
                toast({
                    title: "Error",
                    description: "Something went wrong trying to upload the allow list. Check console."
                })
                console.log(res);
                return;
            }

            if (Object.keys(res.errors).length > 0) {
                toast({
                    title: "Error",
                    description: "Something went wrong trying to upload the allow list. Check console."
                })
                console.log(res);
                return;
            }

            const url = `https://${res}.ipfs.dweb.link`;
            //@ts-ignore
            toast({title: "Submitted", description: `Allow list has been submitted at ipfs://${res.cid}`});

            //@ts-ignore
            setAllowListCID(res.cid);
        } catch (e) {
            toast({title: "Error", description: "Failed to upload allow list"});
            console.log("Error uploading allow list", e);
        } finally {
            setLoading(false);
        }

    }

    return (
        <div className={"space-y-4"}>
            {allowListCID && (
                <Alert className={"m-4 bg-green-300 max-w-xl"}>
                    <AlertTitle>Uploaded!</AlertTitle>
                    <AlertDescription>
                        Allowlist available on IPFS at <a className={"text-blue-500"}
                                                          href={`https://${allowListCID}.ipfs.dweb.link`}
                                                          target="_blank"
                                                          rel="noopener noreferrer">ipfs://{allowListCID}</a>
                    </AlertDescription>
                </Alert>
            )}
            <DataTable columns={columns} data={allowList}/>
            <Button type={"submit"} disabled={loading} onClick={() => onSubmit(allowList)}
                    className={"bg-green-400 hover:bg-green-500"}>Store allow list</Button>
            <section>
                <p className={"text-sm"}>{allowList.length} records</p>
            </section>
        </div>
    )
}

