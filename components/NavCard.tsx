import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from "next/link";
import {cn} from "@/lib/utils";


export interface NavCardProps {
    className?: string;
    title: string;
    description: string;
    content: string;
    href: string;
}

export const NavCard = ({className, title, description, content, href, ...props}: NavCardProps) => {
    return (
        <Link href={href} legacyBehavior passHref>
            <Card className={cn("w-[380px]", "h-[250px]", className)} {...props}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {content}
                </CardContent>
            </Card>
        </Link>
    )
}