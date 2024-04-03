"use client"

import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import {AllowlistEntry, validateAllowlist} from "@hypercerts-org/sdk";
import {useUploadAllowList} from "@/hooks/useUploadAllowlist";
import {useState} from "react";
import {ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";


export const AllowListTable = ({data}: { data: AllowlistEntry[] }) => {
    const columnHelper = createColumnHelper<AllowlistEntry>()

    const defaultColumns = [
        columnHelper.display({
            id: "address", cell: info => info.getValue(), header: () => <span>Address</span>,
        }),
        columnHelper.display({id: "units", cell: info => info.getValue(), header: () => <span>Units</span>,}),
    ]

    console.log(data)

    const table = useReactTable({
        data,
        columns: defaultColumns,
        getCoreRowModel:
            getCoreRowModel(),
    })
    const {toast} = useToast();
    const {uploadAllowList} = useUploadAllowList();
    const [allowListCID, setAllowListCID] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);


    const onSubmit = async (values: AllowlistEntry[]) => {
        try {
            setLoading(true);

            const totalUnits = values.reduce((acc, curr) => acc + BigInt(curr.units), 0n);
            const res = await uploadAllowList(values, totalUnits);

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

    console.log(table.getRowModel().rows)

    return (
        <div className={"space-y-4"}>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={defaultColumns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Button type={"submit"} onClick={() => onSubmit(data)} className={"bg-green-400 hover:bg-green-500"}>Store
                allow
                list</Button>
        </div>
    )
}

