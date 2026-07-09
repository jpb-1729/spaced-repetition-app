'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteCourse } from '@/actions/course'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { EmptyState, EmptyStateTitle, EmptyStateDescription } from '@/components/ui/empty-state'

type Course = {
  id: string
  name: string
  subject: string | null
  level: string | null
  isPublished: boolean
  _count: { decks: number; enrollments: number }
}

export function CourseList({ courses }: { courses: Course[] }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(() => deleteCourse(id))
  }

  if (courses.length === 0) {
    return (
      <EmptyState variant="filled">
        <EmptyStateTitle>No courses yet</EmptyStateTitle>
        <EmptyStateDescription>Create one to get started.</EmptyStateDescription>
      </EmptyState>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Decks</TableHead>
          <TableHead>Enrollments</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell>
              <Link href={`/admin/courses/${course.id}`} className="text-primary font-bold hover:underline">
                {course.name}
              </Link>
            </TableCell>
            <TableCell>{course.subject || '-'}</TableCell>
            <TableCell>{course.level || '-'}</TableCell>
            <TableCell>{course._count.decks}</TableCell>
            <TableCell>{course._count.enrollments}</TableCell>
            <TableCell>
              <Badge variant={course.isPublished ? 'success' : 'outline'}>
                {course.isPublished ? 'Yes' : 'No'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isPending}>
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete &quot;{course.name}&quot;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This deletes the course and all its decks. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(course.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
