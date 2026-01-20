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
import { ArrowUpDown, Clock, User, FileText, MessageSquare } from "lucide-react"

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

export interface ActivityData {
  id: number
  user: string
  action: string
  actionType: "create" | "update" | "delete" | "view" | "message"
  timestamp: string
  details: string
  status: string
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageSquare className="h-4 w-4" />
    case "create":
      return <FileText className="h-4 w-4" />
    case "update":
      return <FileText className="h-4 w-4" />
    case "delete":
      return <FileText className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getActionTypeColor = (type: string) => {
  switch (type) {
    case "create":
      return "bg-blue-100 text-blue-800"
    case "update":
      return "bg-amber-100 text-amber-800"
    case "delete":
      return "bg-red-100 text-red-800"
    case "message":
      return "bg-green-100 text-green-800"
    case "view":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const columns: ColumnDef<ActivityData>[] = [
  {
    accessorKey: "user",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-gray-400" />
        <span className="font-medium">{row.getValue("user")}</span>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <span>{row.getValue("action")}</span>,
  },
  {
    accessorKey: "actionType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("actionType") as string
      return (
        <Badge className={`${getActionTypeColor(type)}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Time
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue("timestamp") as string
      const date = new Date(timestamp)
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{date.toLocaleString()}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 truncate max-w-xs" title={row.getValue("details")}>
        {row.getValue("details")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const isSuccess = status === "Success"
      return (
        <Badge className={isSuccess ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
          {status}
        </Badge>
      )
    },
  },
]

interface ActivityTableProps {
  data: ActivityData[]
}

export function ActivityTable({ data }: ActivityTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "timestamp",
      desc: true,
    },
  ])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        <Input
          placeholder="Search activities..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-9 w-full max-w-sm"
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 px-4 py-2 text-left">
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
                <TableRow key={row.id} className="border-0 hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0">
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No activities found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {table.getFilteredRowModel().rows.length} of {data.length} activity(ies)
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
