"use client"

import { useEffect, useState } from "react"
import { reviewsApi, coursesApi } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, MoreVertical, Search, Star, Trash, User } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await coursesApi.getAll()
        setCourses(data.courses || [])
        
        // Select the first course by default if available
        if (data.courses && data.courses.length > 0 && !selectedCourse) {
          setSelectedCourse(data.courses[0]._id)
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err)
        setError("Failed to load courses. Please try again.")
      }
    }

    fetchCourses()
  }, [selectedCourse])

  // Fetch reviews when course changes
  useEffect(() => {
    async function fetchReviews() {
      if (!selectedCourse) return
      
      try {
        setIsLoading(true)
        const data = await reviewsApi.getByCourse(selectedCourse)
        setReviews(data.reviews || [])
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
        setError("Failed to load reviews. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedCourse) {
      fetchReviews()
    } else {
      setReviews([])
      setIsLoading(false)
    }
  }, [selectedCourse])

  const handleVerifyReview = async (id: string) => {
    try {
      await reviewsApi.update(id, { isVerified: true })
      setReviews(reviews.map(review => 
        review._id === id ? { ...review, isVerified: true } : review
      ))
    } catch (err) {
      console.error("Failed to verify review:", err)
      alert("Failed to verify review. Please try again.")
    }
  }

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      await reviewsApi.delete(id)\
      setReviews(reviews.filter((review  
      return

    try {
      await reviewsApi.delete(id)
      setReviews(reviews.filter((review) => review._id !== id))
    } catch (err) {
      console.error("Failed to delete review:", err)
      alert("Failed to delete review. Please try again.")
    }
  }

  const handleViewReview = (review: any) => {
    setSelectedReview(review)
    setIsReviewDialogOpen(true)
  }

  const filteredReviews = reviews.filter((review) => 
    review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Reviews"
        description="Manage course reviews and ratings"
      />

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-64">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Select a course">
                    {selectedCourse && courses.find(c => c._id === selectedCourse)?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  {courses.map((course) => (
                    <SelectItem 
                      key={course._id} 
                      value={course._id}
                      className="hover:bg-zinc-800 hover:text-white"
                    >
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search reviews..."
                className="pl-9 bg-zinc-900/50 border-zinc-800 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                  <TableHead className="text-zinc-400 w-[15%]">User</TableHead>
                  <TableHead className="text-zinc-400 w-[15%]">Rating</TableHead>
                  <TableHead className="text-zinc-400 w-[30%]">Title</TableHead>
                  <TableHead className="text-zinc-400 w-[20%]">Date</TableHead>
                  <TableHead className="text-zinc-400 w-[10%]">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i} className="hover:bg-zinc-900/50 border-zinc-800">
                        <TableCell>
                          <Skeleton className="h-5 w-24 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-48 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 bg-zinc-800" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-md bg-zinc-800 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : selectedCourse ? (
                  filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <TableRow key={review._id} className="hover:bg-zinc-900/50 border-zinc-800">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-400" />
                            {review.user?.username || "Anonymous"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-zinc-300">{review.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-white truncate max-w-xs">
                          {review.title}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={review.isVerified ? "default" : "secondary"}
                            className={
                              review.isVerified
                                ? "bg-green-900/30 text-green-400 hover:bg-green-900/40"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            }
                          >
                            {review.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                              <DropdownMenuItem
                                className="hover:bg-zinc-800 hover:text-white cursor-pointer"
                                onClick={() => handleViewReview(review)}
                              >
                                <Search className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {!review.isVerified && (
                                <DropdownMenuItem
                                  className="text-green-400 hover:bg-green-900/30 hover:text-green-300 cursor-pointer"
                                  onClick={() => handleVerifyReview(review._id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Verify
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer"
                                onClick={() => handleDeleteReview(review._id)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                      <TableCell colSpan={6} className="text-center text-zinc-500 py-6">
                        No reviews found for this course
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                    <TableCell colSpan={6} className="text-center text-zinc-500 py-6">
                      Please select a course to view reviews
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Detail Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Review Details</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Full review information
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-400" />
                  <span className="font-medium">{selectedReview.user?.username || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < selectedReview.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`} 
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{selectedReview.title}</h3>
                <p className="text-zinc-300 mt-2 whitespace-pre-line">{selectedReview.content}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Created: {new Date(selectedReview.createdAt).toLocaleString()}</span>
                <Badge
                  variant={selectedReview.isVerified ? "default" : "secondary"}
                  className={
                    selectedReview.isVerified
                      ? "bg-green-900/30 text-green-400 hover:bg-green-900/40"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }
                >
                  {selectedReview.isVerified ? "Verified" : "Pending Verification"}
                </Badge>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                {!selectedReview.isVerified && (
                  <Button
                    onClick={() => {
                      handleVerifyReview(selectedReview._id)
                      setIsReviewDialogOpen(false)
                    }}
                    className="bg-green-900/30 text-green-400 hover:bg-green-900/50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Review
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteReview(selectedReview._id)
                    setIsReviewDialogOpen(false)
                  }}
                  className="bg-red-900/30 text-red-400 hover:bg-red-900/50 border-none"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
