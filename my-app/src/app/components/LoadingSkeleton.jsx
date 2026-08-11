export default function LoadingSkeleton() {
    return (
        <div className="max-w-3xl mx-auto px-4">
        <div className="bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-pulse">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-56 h-64 md:h-auto bg-zinc-700 flex-shrink-0"></div>
            <div className="flex-1 p-6 space-y-4">
              <div className="h-7 bg-zinc-700 rounded-lg w-2/3"></div>
              <div className="h-4 bg-zinc-700 rounded w-1/3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-zinc-700 rounded-full w-16"></div>
                <div className="h-6 bg-zinc-700 rounded-full w-20"></div>
                <div className="h-6 bg-zinc-700 rounded-full w-14"></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-zinc-700 rounded w-full"></div>
                <div className="h-3 bg-zinc-700 rounded w-full"></div>
                <div className="h-3 bg-zinc-700 rounded w-4/5"></div>
              </div>
              <div className="h-4 bg-zinc-700 rounded w-1/4 pt-2"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-zinc-700 rounded-lg w-28"></div>
                <div className="h-10 bg-zinc-700 rounded-lg w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}