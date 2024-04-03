import Image from "next/image";
import {NavCard, NavCardProps} from "@/components/NavCard";

export default function Home() {
    const navCardItems: NavCardProps[] = [
        {
            title: "Create",
            description: "Create a new allowlist",
            content: "Create a new allowlist from scratch by providing addresses, units, etc.",
            href: "/create",
        },
        {
            title: "Upload",
            description: "Upload an allowlist from a file",
            content: "Upload an allowlist in CSV format for inspection, modification, validation, etc",
            href: "/upload",
        },
        {
            title: "Inspect",
            description: "Inspect an existing allowlist",
            content: "Provide an allowlist URL to inspect and validate.",
            href: "/inspect",
        },
    ];

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex space-x-2">
                {navCardItems.map(({title, description, content, href}, key) => (
                    <NavCard title={title} description={description} content={content} href={href} key={key}/>
                ))}
            </div>
        </main>
    );
}
