"use client"

import {z} from "zod";
import {isAddress, parseEther} from "viem";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useToast} from "@/components/ui/use-toast";
import {validateAllowlist} from "@hypercerts-org/sdk";
import {useUploadAllowList} from "@/hooks/useUploadAllowlist";
import {useState} from "react";

const ethAddressSchema = z.string()
    .refine((value) => isAddress(value), {
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

type CreateAllowListFormProps = {
    defaultValues?: AllowListCreateFormValues
    displayUnits?: boolean
}

export const UploadAllowlistForm = ({defaultValues = defaults, displayUnits = false}) => {
    const {toast} = useToast();
    const {uploadAllowList} = useUploadAllowList();
    const [allowListCID, setAllowListCID] = useState<string>("");

    const form = useForm<AllowListCreateFormValues>({
        resolver: zodResolver(AllowListCreateSchema),
        defaultValues,
        mode: "onChange",
    });

    const {control, register, handleSubmit, watch} = form;

    const {fields, append, remove} = useFieldArray({
        control,
        name: "allowList",
    });

    console.log(watch("allowList"));

    const totalUnits = watch("allowList")?.reduce((acc, curr) => acc + BigInt(curr.units), 0n);
    console.log("Total units", totalUnits);

    const onSubmit = async (values: AllowListCreateFormValues) => {
        const validationResult = validateAllowlist(values.allowList, parseEther("1"));

        if (!validationResult.valid) {
            toast({title: "Error", description: "Incorrect values in allow list"});
            return;
        }

        console.log("Validation result", validationResult);

        try {
            const res = await uploadAllowList(values);
            const url = `https://${res}.ipfs.dweb.link`;
            toast({title: "Submitted", description: `Allow list has been submitted at ipfs://${res}`});
            setAllowListCID(res);
        } catch (e) {
            toast({title: "Error", description: "Failed to upload allow list"});
            console.log("Error uploading allow list", e);

        }

    }

    return (
        <Form {...form}>
            {allowListCID && (
                <p>Allowlist available on IPFS at <a href={`https://${allowListCID}.ipfs.dweb.link`}>{allowListCID}</a>
                </p>)}
            <form onSubmit={handleSubmit(onSubmit)} className={"flex-column space-y-4"}>

                <div className="flex flex-row space-x-2 font-bold">
                    <div className="w-96 text-left">Address</div>
                    <div className="w-24 text-left">Distribution</div>
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
                                    className={"text-sm text-red-500"}>{form.formState.errors.allowList[index].address.message}</span>
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
                                    className={"text-sm text-red-500"}>{form.formState.errors.allowList[index].units.message}</span>
                            )}
                        </div>
                        {displayUnits && (
                            <div className={"flex-col"}>
                                <div
                                    className={"text-sm"}>{BigInt(BigInt(form.watch(`allowList.${index}.units`)) * 100n / totalUnits).toString()}</div>
                                {/*<Input*/}
                                {/*    key={field.id}*/}
                                {/*    {...register(`allowList.${index}.units` as const)}*/}
                                {/*    placeholder={"Units"}*/}
                                {/*    type={"text"}*/}
                                {/*    className={"w-96"}*/}
                                {/*    disabled={true}*/}
                                {/*    value={(BigInt(form.watch(`allowList.${index}.units` as const)) / totalUnits * 100n).toString()}*/}
                                {/*/>*/}
                                {form.formState.errors.allowList?.[index]?.units && (
                                    <span
                                        className={"text-sm text-red-500"}>{form.formState.errors.allowList[index].units.message}</span>
                                )}
                            </div>
                        )}

                        <Button onClick={() => remove(index)} className={"bg-red-500 hover:bg-red-600"}>Remove</Button>
                    </div>
                ))}
                <div className={"space-x-4"}>
                    <Button onClick={() => append({address: "", units: parseEther("1")})}
                            className={"bg-blue-400 hover:bg-blue-500"}>Add Address</Button>
                    <Button type={"submit"} className={"bg-green-400 hover:bg-green-500"}>Store allow list</Button>
                    {form.formState.errors.general && (
                        <span className={"text-sm text-red-500"}>{form.formState.errors.general.message}</span>
                    )}


                </div>
            </form>
        </Form>
    )
}

