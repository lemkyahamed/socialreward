import React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "../../utils"
import { Button } from "./Button"

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) {
  const pages = []
  
  // Logic to show limited pages
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, "ellipsis", totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "ellipsis", totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages)
    }
  }

  return (
    <nav className={cn("flex items-center justify-center space-x-2 py-4", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="sr-only">Previous Page</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center space-x-1">
        {pages.map((page, idx) => {
          if (page === "ellipsis") {
            return (
              <div
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-zinc-500"
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "primary" : "ghost"}
              className={cn("h-8 w-8 rounded-lg px-0", currentPage === page ? "font-bold" : "font-medium")}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="sr-only">Next Page</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
