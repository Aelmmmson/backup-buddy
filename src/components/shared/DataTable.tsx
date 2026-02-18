
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
    key: string;
    header: string;
    className?: string;
    hideOnMobile?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    emptyMessage = "No data found",
    isLoading = false,
    onRowClick,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="p-8 text-center bg-card rounded-lg border border-border">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="p-8 text-center bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead
                                key={col.key}
                                className={cn(col.className, col.hideOnMobile && "hidden md:table-cell")}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow
                            key={keyExtractor(item)}
                            className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                            onClick={() => onRowClick && onRowClick(item)}
                        >
                            {columns.map((col) => (
                                <TableCell
                                    key={`${keyExtractor(item)}-${col.key}`}
                                    className={cn(col.className, col.hideOnMobile && "hidden md:table-cell")}
                                >
                                    {col.render ? col.render(item) : (item as unknown)[col.key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
