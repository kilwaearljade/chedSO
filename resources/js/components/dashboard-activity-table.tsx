import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, User, Calendar, MessageSquare, Clock } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface DashboardActivityData {
  id: number
  type: "user" | "appointment" | "feedback"
  name: string
  details: string
  status?: string
  createdAt: string
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "user":
      return <User className="h-4 w-4 text-blue-500" />
    case "appointment":
      return <Calendar className="h-4 w-4 text-green-500" />
    case "feedback":
      return <MessageSquare className="h-4 w-4 text-purple-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "user":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New User</Badge>
    case "appointment":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Appointment</Badge>
    case "feedback":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Feedback</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

const getStatusBadge = (status?: string) => {
  if (!status) return null
  
  const statusLower = status.toLowerCase()
  if (statusLower === "pending" || statusLower === "in progress") {
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
  }
  if (statusLower === "complete" || statusLower === "done" || statusLower === "approved") {
    return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>
  }
  if (statusLower === "cancelled" || statusLower === "declined") {
    return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
  }
  return <Badge variant="outline">{status}</Badge>
}

const columns: ColumnDef<DashboardActivityData>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          {getActivityIcon(row.getValue("type") as string)}
          {getTypeBadge(row.getValue("type") as string)}
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 truncate max-w-md" title={row.getValue("details")}>
        {row.getValue("details")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status") as string | undefined),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{format(date, "MMM d, yyyy h:mm a")}</span>
        </div>
      )
    },
  },
]

interface DashboardActivityTableProps {
  data: DashboardActivityData[]
}

export function DashboardActivityTable({ data }: DashboardActivityTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel({
      pageSize: 10,
    }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter,
    },
    globalFilterFn: "includesString",
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Input
          placeholder="Search activities..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-9 w-full max-w-sm"
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 px-4 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No recent activity found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} activity(ies)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
