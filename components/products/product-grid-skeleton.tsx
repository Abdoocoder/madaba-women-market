import { Skeleton } from "@/components/ui/skeleton"

export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Sidebar Skeleton */}
            <aside className="hidden lg:block lg:col-span-1">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </aside>

            {/* Product Cards Skeleton */}
            <div className="col-span-2 lg:col-span-3">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[200px] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-10 w-full mt-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
