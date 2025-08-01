import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Original Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  children?: React.ReactNode;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  children,
}: PaginationProps) {
  const t = useTranslations();
  
  // If children are provided, render them (new component pattern)
  if (children) {
    return (
      <nav
        role="navigation"
        aria-label={t('pagination.navigation') || "pagination"}
        className={cn("mx-auto flex w-full justify-center", className)}
      >
        {children}
      </nav>
    );
  }
  
  // Original implementation
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[]   = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If total pages are less than or equal to maxPagesToShow, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end page numbers
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }
      
      // Add ellipsis before middle pages if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis1');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis after middle pages if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis2');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  if (totalPages <= 1) return null;
  
  return (
    <nav 
      className={`flex items-center space-x-2 rtl:space-x-reverse ${className}`} 
      aria-label={t('pagination.navigation') || "Pagination"}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label={t('pagination.previous') || 'Previous'}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === 'ellipsis1' || pageNumber === 'ellipsis2') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }
          
          return (
            <Button
              key={index}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageNumber as number)}
              aria-current={currentPage === pageNumber ? "page" : undefined}
              aria-label={`${t('pagination.page') || 'Page'} ${pageNumber}`}
              className="h-8 w-8"
            >
              <span className="text-sm">{pageNumber}</span>
            </Button>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label={t('pagination.next') || 'Next'}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

// New Components
export function PaginationContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

export function PaginationItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />;
}

export function PaginationLink({
  className,
  isActive,
  ...props
}: React.ComponentProps<typeof Button> & {
  isActive?: boolean;
}) {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "default" : "outline"}
      size="icon"
      className={cn("h-8 w-8", className)}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const t = useTranslations();
  return (
    <Button
      aria-label={t('pagination.previous') || "Go to previous page"}
      size="icon"
      variant="outline"
      className={cn("gap-1 h-8 w-8", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
}

export function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const t = useTranslations();
  return (
    <Button
      aria-label={t('pagination.next') || "Go to next page"}
      size="icon"
      variant="outline"
      className={cn("gap-1 h-8 w-8", className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={cn("flex h-8 w-8 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
    </span>
  );
} 