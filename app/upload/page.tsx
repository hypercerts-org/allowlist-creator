"use client";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {UploadCsvForm} from "@/components/UploadCsvForm";
import {useState} from "react";
import Papa from 'papaparse';
import {isAddress} from "viem";
import {AllowListTable} from "@/components/AllowListTable";
import {AllowlistEntry} from "@hypercerts-org/sdk";

const isAllowListEntry = (entry: any): entry is { address: string, fractions: bigint } => {
    return entry?.address && isAddress(entry?.address, {strict: false}) && entry?.fractions && BigInt(entry?.fractions) > 0;
}

export default function Home() {
    const [errors, setErrors] = useState<string[]>([]);

    const [allowList, setAllowList] = useState<AllowlistEntry[] | undefined>(undefined)
    const handleFileSelect = (file?: Papa.LocalFile) => {
        if (!file) {
            return;
        }
        // Optional: Immediately parse the file if needed
        Papa.parse(file, {
            complete: (results) => {
                const parsedData = results.data.map((row) => {
                    if (!isAllowListEntry(row)) {
                        setErrors([...errors, `Invalid row ${JSON.stringify(row)}`]);
                        return {address: "", units: 0n};
                    }

                    return {address: row.address, units: row.fractions}
                })

                if (errors.length === 0) {
                    setAllowList(parsedData);
                }
            },
            header: true // if your CSV has a header row
        });
    }


    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24 space-y-4">
            <h1 className="text-xl uppercase">Upload allow list</h1>
            <div className={"space-y-4 max-w-xl"}>
                <section className={"space-y-4"}>
                    <h2 className="text-lg font-bold">Instructions</h2>
                    <p>
                        Provide a filled in template. This page will render, verify and provide a means to upload the
                        allow list
                    </p>
                    <p>
                        When you submit the form, the application will execute additional validations before uploading
                        the allow list to IPFS. When successful the allow list will be available at the CID displayed.
                    </p>
                    <p>
                        Hypercerts will be minted with a total supply of 1 ether (10 ^ 18 units). The percentages
                        provided in the form below will be used to calculate the number of units each address is allowed
                        to mint.
                    </p>
                    <h2 className="text-lg font-bold">Download template</h2>
                    <p>
                        No clue how you got here but excited to get started? Download the template below. Note that the
                        total amount of units should equal 1 ether or
                        1000000000000000000 or 10 ** 18.

                    </p>

                    <br/>

                    <a href={'/allowlist.csv'}>
                        <Button className={"bg-blue-400 hover:bg-blue-500"}>
                            Download template
                        </Button>
                    </a>

                </section>
                <Separator/>
            </div>
            <UploadCsvForm onFileSelect={handleFileSelect}/>
            {errors && errors.length > 0 && (<section>
                <h2 className="text-lg">Errors</h2>
                <ul>
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </section>)}
            {allowList && (
                <section>
                    <h2 className="text-lg">Allow list data</h2>
                    <AllowListTable allowList={allowList}/>
                </section>
            )}
        </main>
    );
}
