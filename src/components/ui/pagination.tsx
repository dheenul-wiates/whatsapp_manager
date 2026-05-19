import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  buildUrl: (page: number) => string
  className?: string
}

export function Pagination({ currentPage, totalPages, buildUrl, className }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first page
    pages.push(1)

    if (currentPage > 3) {
      pages.push("ellipsis")
    }

    // Show current page and neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis")
    }

    // Always show last page
    pages.push(totalPages)

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Previous button */}
      <Link href={buildUrl(currentPage - 1)} className={currentPage === 1 ? "pointer-events-none" : ""}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </Link>

      {/* Page numbers */}
      {pages.map((page, idx) => {
        if (page === "ellipsis") {
          return (
            <div key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
          )
        }

        const isActive = page === currentPage

        return (
          <Link key={page} href={buildUrl(page)}>
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 w-8 p-0 text-[13px]",
                isActive && "pointer-events-none"
              )}
            >
              {page}
            </Button>
          </Link>
        )
      })}

      {/* Next button */}
      <Link href={buildUrl(currentPage + 1)} className={currentPage === totalPages ? "pointer-events-none" : ""}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  )
}
