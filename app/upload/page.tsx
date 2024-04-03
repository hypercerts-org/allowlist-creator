"use client";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {UploadCsvForm} from "@/components/UploadCsvForm";
import {useState} from "react";
import Papa from 'papaparse';
import {isAddress} from "viem";
import {AllowListCreateFormValues, UploadAllowlistForm} from "@/components/UploadAllowListForm";

export default function Home() {
    const [selectedFile, setSelectedFile] = useState(null);

    const [allowList, setAllowList] = useState<AllowListCreateFormValues | undefined>(undefined)
    const handleFileSelect = (file) => {
        setSelectedFile(file);

        // Optional: Immediately parse the file if needed
        Papa.parse(file, {
            complete: (results) => {
                console.log(results.data);
                const parsedData = results.data.map((row) => {
                    const address = row?.address && isAddress(row?.address) ? row?.address : null;
                    const units = row?.fractions ? row?.fractions : null;
                    return {address, units}
                })
                setAllowList({allowList: parsedData});
                setSelectedFile(null)
            },
            header: true // if your CSV has a header row
        });
    }


    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24 space-y-4">
            <h1 className="text-xl uppercase">Upload allow list</h1>
            <section>
                <h2 className="text-lg font-bold">Welcome to the allow list upload page</h2>
                <p>
                    This is a simple allow list upload flow.
                </p>
                <h2 className="text-lg font-bold">Instructions</h2>
                <p>
                    Provide a filled in template. This page will render, verify and provide a means to upload the
                    allow
                    list
                </p>
                <h2 className="text-lg font-bold">Download template</h2>
                <p>
                    No clue how you got here but excited to get started? Download the template below. Note that the
                    total amount of units should equal 1 ether or
                    1000000000000000000 or 10 ** 18.

                    <br/>

                    <a href={'/allowlist.csv'}>
                        <Button className={"bg-blue-400 hover:bg-blue-500"}>
                            Download template
                        </Button>
                    </a>
                </p>

            </section>
            <Separator/>
            <section>
                <UploadCsvForm onFileSelect={handleFileSelect}/>
            </section>
            {allowList && (
                <section>
                    <h2 className="text-lg">Allow list data</h2>
                    <UploadAllowlistForm defaultValues={allowList} displayUnits={true}/>
                </section>
            )}
        </main>
    );
}
