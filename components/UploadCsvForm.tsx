import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import Papa from "papaparse";

export function UploadCsvForm({onFileSelect}: { onFileSelect: (file?: Papa.LocalFile) => void }) {

    return (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="allow-list">Allow list file</Label>
            <Input id="allowListUpload" type="file" accept=".csv"
                   onChange={(e) => onFileSelect(e?.target?.files?.[0])}/>
        </div>
    )
}
