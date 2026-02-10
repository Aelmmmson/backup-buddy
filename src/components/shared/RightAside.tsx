
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface RightAsideProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export function RightAside({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
}: RightAsideProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-md w-full overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>{title}</SheetTitle>
                    {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
                </SheetHeader>
                {children}
            </SheetContent>
        </Sheet>
    );
}
