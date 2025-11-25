import { Card, CardContent, CardHeader } from '@/components/ui/card'

export const TaskCardSkeleton = () => {
  return (
    <Card className="border-l-4 border-l-gray-300 bg-white animate-pulse">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-28"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-gray-200 rounded flex-1"></div>
          <div className="h-9 bg-gray-200 rounded w-9"></div>
          <div className="h-9 bg-gray-200 rounded w-9"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export const KanbanColumnSkeleton = () => {
  return (
    <Card className="flex flex-col h-full min-h-[650px] border-2 bg-white animate-pulse">
      <CardHeader className="bg-gradient-to-r from-gray-100 to-transparent border-b-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded-full w-8"></div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-5 bg-gray-50/30">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export const GridSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export const KanbanSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gray-100 border-gray-200 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KanbanColumnSkeleton />
        <KanbanColumnSkeleton />
      </div>
    </div>
  )
}

