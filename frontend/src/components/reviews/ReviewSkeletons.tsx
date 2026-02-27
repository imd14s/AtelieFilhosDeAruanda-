

export const RatingSummarySkeleton = () => (
    <div className="flex items-center gap-2 animate-pulse">
        <div className="w-8 h-4 bg-gray-200 rounded"></div>
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded-full"></div>
            ))}
        </div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
    </div>
);

export const UGCGallerySkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square bg-gray-100 rounded-sm"></div>
        ))}
    </div>
);

export const ReviewItemSkeleton = () => (
    <div className="flex flex-col md:flex-row gap-6 pb-8 animate-pulse">
        <div className="w-full md:w-48 shrink-0">
            <div className="w-20 h-3 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="flex-1 space-y-3">
            <div className="w-full h-4 bg-gray-100 rounded"></div>
            <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
            <div className="w-20 h-2 bg-gray-100 rounded"></div>
        </div>
    </div>
);
