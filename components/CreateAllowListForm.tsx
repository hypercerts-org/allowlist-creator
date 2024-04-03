"use client"

import {z} from "zod";
import {isAddress, parseEther} from "viem";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useToast} from "@/components/ui/use-toast";
import {useUploadAllowList} from "@/hooks/useUploadAllowlist";
import {useState} from "react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

const ethAddressSchema = z.string()
    .refine((value) => isAddress(value, {strict: false}), {
        message: "Provided address is invalid. Please double check.",
    });

// Total of units should match 1 ether (parseEther("1"))
export const AllowListCreateSchema = z.object({
    allowList: z.array(z.object({
        address: ethAddressSchema,
        units: z.coerce.number().min(0.01).max(100)
    }))
}).refine((values) => values.allowList.reduce((acc, curr) => acc + curr.units, 0) === 100, {
    message: "Distribute 100% of minting units.",
    path: ["general"]
})

export type AllowListCreateFormValues = z.infer<typeof AllowListCreateSchema>;

const defaults: AllowListCreateFormValues = {
    allowList: [{address: "0xC3l0.......m1nt", units: 100}]
}

export const CreateAllowListForm = ({defaultValues = defaults, displayUnits = false}) => {
    const {toast} = useToast();
    const {uploadAllowList} = useUploadAllowList();
    const [allowListCID, setAllowListCID] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<AllowListCreateFormValues>({
        resolver: zodResolver(AllowListCreateSchema),
        defaultValues,
        mode: "onChange",
    });

    const {control, register, handleSubmit} = form;

    const {fields, append, remove} = useFieldArray({
        control,
        name: "allowList",
    });

    const onSubmit = async (values: AllowListCreateFormValues) => {


        try {
            setLoading(true);
            const parsedAllowList = values.allowList.map(
                (entry) => ({address: entry.address, units: BigInt(entry.units)})
            )

            const totalUnits = parsedAllowList.reduce((acc, curr) => acc + BigInt(curr.units), 0n);
            const res = await uploadAllowList(parsedAllowList, totalUnits);

            // TODO better typing check if res has CID
            // @ts-ignore
            if (!res.cid || Object.keys(res.errors).length > 0) {
                toast({
                    title: "Error",
                    description: "Something went wrong trying to upload the allow list. Check console."
                })
                console.log(res);
                return;
            }

            // @ts-ignore
            toast({title: "Submitted", description: `Allow list has been submitted at ipfs://${res.cid}`});
            // @ts-ignore
            setAllowListCID(res?.cid);
        } catch (e) {
            toast({title: "Error", description: "Failed to upload allow list"});
            console.log("Error uploading allow list", e);
        } finally {
            setLoading(false);
        }

    }

    return (
        <Form {...form}>
            {allowListCID && (
                <Alert className={"m-4"}>
                    <AlertTitle>Uploaded!</AlertTitle>
                    <AlertDescription>
                        Allowlist available on IPFS at <a
                        href={`https://${allowListCID}.ipfs.dweb.link`}>{allowListCID}</a> </AlertDescription>
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className={"flex-column space-y-4"}>

                <div className="flex flex-row space-x-2 font-bold">
                    <div className="w-96 text-left">Address</div>
                    <div className="w-24 text-left">Fraction (%)</div>
                    {displayUnits && <div className="w-96 text-left">Units</div>}
                    <div className="w-20 text-left">Action</div>
                </div>

                {fields.map((field, index) => (
                    <div className={"flex flex-row space-x-2"} key={`allow-list-entry-${index}`}>
                        <div className={"flex-col"}>
                            <Input
                                key={field.id}
                                {...register(`allowList.${index}.address` as const)}
                                placeholder={"Address"}
                                type={"text"}
                                className={"w-96"}
                            />
                            {form.formState.errors.allowList?.[index]?.address && (
                                <span
                                    // TODO fix this
                                    // @ts-ignore
                                    className={"text-sm text-red-500"}>{form.formState.errors.allowList[index].address?.message}</span>
                            )}
                        </div>
                        <div className={"text-sm"}>
                            <Input
                                key={field.id}
                                {...register(`allowList.${index}.units` as const)}
                                placeholder={"Units"}
                                type={"number"}
                                className={"w-24"}
                                min={0.01}
                                step={0.01}
                                max={100}
                            />
                            {form.formState.errors.allowList?.[index]?.units && (
                                <span
                                    // TODO fix this
                                    // @ts-ignore
                                    className={"text-sm text-red-500"}>{form.formState.errors.allowList[index].units?.message}</span>
                            )}
                        </div>
                        {displayUnits && (
                            <div className={"flex-col"}>
                                <Input
                                    key={field.id}
                                    {...register(`allowList.${index}.units` as const)}
                                    placeholder={"Units"}
                                    type={"text"}
                                    className={"w-96"}
                                    disabled={true}
                                    value={((parseEther("1") / BigInt(100)) * BigInt(form.watch(`allowList.${index}.units` as const))).toString()}
                                />
                                {form.formState.errors.allowList?.[index]?.units && (
                                    <span
                                        // TODO fix this
                                        // @ts-ignore
                                        className={"text-sm text-red-500"}>{form.formState.errors.allowList[index].units.message}</span>
                                )}
                            </div>
                        )}

                        <Button onClick={() => remove(index)} className={"bg-red-500 hover:bg-red-600"}>Remove</Button>
                    </div>
                ))}
                <div className={"space-x-4"}>
                    <Button onClick={() => append({address: "", units: 0})}
                            className={"bg-blue-400 hover:bg-blue-500"}>Add Address</Button>
                    <Button type={"submit"} className={"bg-green-400 hover:bg-green-500"} disabled={loading}>Store allow
                        list</Button>
                    {   // TODO fix this
                        // @ts-ignore
                        form.formState.errors?.general && (
                        // @ts-ignore
                        <span className={"text-sm text-red-500"}>{form.formState.errors.general.message}</span>
                    )}
                </div>
            </form>
        </Form>
    )
}

