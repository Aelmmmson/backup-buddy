
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FilterOption {
    key: string;
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
}

interface SearchFilterProps {
    searchValue: string;
    onSearchChange: (val: string) => void;
    searchPlaceholder?: string;
    filters?: FilterOption[];
}

export function SearchFilter({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    filters = [],
}: SearchFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="pl-8 w-full"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            {filters.map((filter) => (
                <div key={filter.key} className="w-full sm:w-[200px]">
                    <Select value={filter.value} onValueChange={filter.onChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                            {filter.options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ))}
        </div>
    );
}
