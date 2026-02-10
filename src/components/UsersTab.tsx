

/**
 * UsersTab Component
 * ==================
 * Settings tab for managing users with search, filters, and backend CRUD.
 * Updated to use Modal, remove mock employees, and follow specific data structure.
 */

import { useState, useEffect } from "react";
import { Plus, Edit2, UserPlus, Trash2, Mail, Phone, Shield, User as UserIcon, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────

interface User {
    id: number;
    username: string;
    email: string;
    phone: string;
    status: "Active" | "Inactive";
    role: string;
    userRole?: string; // Optional based on provided JSON
    password?: string; // Only for sending, not receiving typically
    posted_by: number;
}

interface Role {
    id: number;
    name: string;
}

export function UsersTab() {
    const { toast } = useToast();
    const currentUser = getUser();

    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form Fields
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("Active");

    // useEffect fetch block
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Roles
                const rolesRes = await api.get<{ results: Role[] }>("/get-users-roles");
                if (rolesRes.data.results) {
                    setRoles(rolesRes.data.results);
                }

                // Users
                const usersRes = await api.get<{ results: User[] }>("/get-users");
                if (usersRes.data.results) {
                    setUsers(usersRes.data.results);
                }
            } catch (err: unknown) {
                console.error("Fetch failed:", err);
                const message = err instanceof Error ? err.message : "Unknown error";
                toast({
                    title: "Error",
                    description: `Could not load users or roles: ${message}`,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const filteredUsers = users.filter((user) => {
        const searchLower = searchValue.toLowerCase();
        const matchesSearch =
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.phone?.includes(searchLower);
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
    });

    // Pagination calculations
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const handleAddNew = () => {
        setEditingUser(null);
        setUsername("");
        setEmail("");
        setPhone("");
        setRole("");
        setStatus("Active");
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setUsername(user.username);
        setEmail(user.email);
        setPhone(user.phone);
        setRole(user.role);
        setStatus(user.status);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!username || !email || !role) {
            toast({
                title: "Validation Error",
                description: "Username, Email, and Role are required.",
                variant: "destructive",
            });
            return;
        }

        const payload = {
            username,
            email,
            phone,
            role,
            status: status === "Active" ? "1" : "0", // Convert to '1' or '0' for backend
            posted_by: currentUser?.user_id || 1,
        };

        try {
            if (editingUser) {
                // Update
                await api.put(`/update-user/${editingUser.id}`, payload);
                toast({ title: "Success", description: "User updated successfully." });
            } else {
                // Create - backend auto-generates password
                await api.post("/user/register", payload);
                toast({ title: "Success", description: "User registered successfully." });
            }

            // Refresh list
            const res = await api.get<{ results: User[] }>("/get-users");
            if (res.data.results) {
                setUsers(res.data.results);
            }

            setIsModalOpen(false);
        } catch (err: unknown) {
            console.error("Save failed:", err);
            const message = err instanceof Error ? err.message : "Failed to save user.";
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const columns: Column<User>[] = [
        {
            key: "username",
            header: "Username",
            className: "font-medium",
            render: (u) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background shadow-sm">
                        {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{u.username}</span>
                </div>
            )
        },
        { key: "email", header: "Email", hideOnMobile: true },
        { key: "phone", header: "Phone", hideOnMobile: true },
        {
            key: "role",
            header: "Role",
            render: (u) => (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 w-fit text-xs font-medium border border-border/50 shadow-sm">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="capitalize">{u.role}</span>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            render: (user) => <StatusBadge status={user.status} />,
        },
        {
            key: "actions",
            header: "Action",
            className: "w-16",
            render: (user) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={() => handleEdit(user)}
                        title="Edit user"
                    >
                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>
                </div>
            ),
        },
    ];

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (value: string) => {
        const newItemsPerPage = parseInt(value, 10);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 px-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/50 p-4 rounded-xl border border-dashed border-border/60 shadow-sm backdrop-blur-sm">
                <SearchFilter
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Search users..."
                    filters={[
                        {
                            key: "status",
                            label: "Status",
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { value: "all", label: "All Status" },
                                { value: "Active", label: "Active" },
                                { value: "Inactive", label: "Inactive" },
                            ],
                        },
                        {
                            key: "role",
                            label: "Role",
                            value: roleFilter,
                            onChange: setRoleFilter,
                            options: [
                                { value: "all", label: "All Roles" },
                                ...roles.map((r) => ({ value: r.name, label: r.name.charAt(0).toUpperCase() + r.name.slice(1) })),
                            ],
                        },
                    ]}
                />
                <Button onClick={handleAddNew} size="sm" className="ml-auto shrink-0 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <DataTable
                    data={paginatedUsers}
                    columns={columns}
                    keyExtractor={(user) => user.id.toString()}
                    emptyMessage={loading ? "Loading users..." : "No users found"}
                    isLoading={loading}
                />
            </div>

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border border-border bg-card rounded-xl shadow-sm gap-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Rows per page:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="h-8 w-[70px] bg-background">
                                <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent>
                                {[5, 10, 20, 50].map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="hidden sm:inline">
                            {startIndex + 1}-{endIndex} of {totalItems}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8"
                        >
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium px-2 block sm:hidden">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="hidden sm:flex space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            className={`h-8 w-8 p-0 ${currentPage === pageNum ? "shadow-sm" : ""}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] border-border/80 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            {editingUser ? <Edit2 className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
                            {editingUser ? "Edit User" : "Add New User"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? "Update user details below. Changes are saved immediately."
                                : "Fill in the details to create a new user account."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-1.5">
                                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                    className="focus-visible:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="024xxxxxxx"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                    Role
                                </Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={r.name}>
                                                {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="flex items-center gap-1.5">
                                    Activity Status
                                </Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading} className="shadow-md hover:shadow-lg transition-all">
                            {editingUser ? "Save Changes" : "Create Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

