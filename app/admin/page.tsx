import Image from "next/image";

export default function Admin() {
    return (
        <div className="relative w-full h-screen">
            <Image 
                alt="background" 
                src="/images/administration/administration-team.png" 
                fill 
                className="object-contain" 
                loading="lazy" 
            />
        </div>
    );
}
