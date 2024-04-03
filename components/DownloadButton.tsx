import {Button} from "@/components/ui/button";
import Link from "next/link";

export const DownloadButton = ({className, ...props}) => {

    return (
        <a href={'/allowlist.csv'}>
            <Button className={className} {...props} >Download template</Button>
        </a>)
}