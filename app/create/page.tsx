import Image from "next/image";
import {CreateAllowListForm} from "@/components/CreateAllowListForm";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24 space-y-4">
            <h1 className="text-xl uppercase">Create allow list</h1>
            <div className={"space-y-4"}>

                <section className={"space-y-4"}>
                    <h2 className="text-lg font-bold">Welcome to the allow list creation page</h2>
                    <p>
                        This is a simple allow list creation form.
                    </p>
                    <h2 className="text-lg font-bold">Instructions</h2>
                    <p>
                        To create an allow list, you need to provide a list of addresses and the number of units they
                        are
                        allowed to mint.
                    </p>
                    <h2 className="text-lg font-bold">Download template</h2>
                    <p>
                        This process works well for smaller lists. In case you have larger groups, or love spreadsheets,
                        download the template below and head to <Link href={'/upload'} legacyBehavior>the Upload
                        page</Link>.


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
            <section>
                <CreateAllowListForm/>
            </section>
        </main>
    );
}
