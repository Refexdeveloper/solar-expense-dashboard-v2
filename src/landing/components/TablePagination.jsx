export default function TablePagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push('...')
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i)
            }
            if (currentPage < totalPages - 2) pages.push('...')
            pages.push(totalPages)
        }
        return pages
    }

    const pageNumbers = getPageNumbers()

    return (
        <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
            <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700">
                    {startItem}-{endItem}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{totalItems}</span> requests
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <i className="ri-arrow-left-s-line" />
                </button>

                {pageNumbers.map((page, idx) =>
                    page === '...' ? (
                        <span
                            key={`dots-${idx}`}
                            className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`h-9 w-9 cursor-pointer rounded-lg text-sm font-semibold transition-all ${
                                page === currentPage
                                    ? 'border border-teal-700 bg-teal-700 text-white shadow-sm'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <i className="ri-arrow-right-s-line" />
                </button>
            </div>
        </div>
    )
}
