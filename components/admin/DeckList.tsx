'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteDeck } from '@/actions/deck'
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

type Deck = {
  id: string
  name: string
  ordinal: number
  cardsPerSession: number
  passingScore: number
  isOptional: boolean
  _count: { cards: number }
}

export function DeckList({ decks, courseId }: { decks: Deck[]; courseId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(() => deleteDeck(id))
  }

  if (decks.length === 0) {
    return (
      <EmptyState variant="filled">
        <EmptyStateTitle>No decks yet</EmptyStateTitle>
        <EmptyStateDescription>Add one to get started.</EmptyStateDescription>
      </EmptyState>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Cards</TableHead>
          <TableHead>Per Session</TableHead>
          <TableHead>Pass %</TableHead>
          <TableHead>Optional</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {decks.map((deck) => (
          <TableRow key={deck.id}>
            <TableCell>{deck.ordinal}</TableCell>
            <TableCell className="font-bold">{deck.name}</TableCell>
            <TableCell>{deck._count.cards}</TableCell>
            <TableCell>{deck.cardsPerSession}</TableCell>
            <TableCell>{deck.passingScore}%</TableCell>
            <TableCell>
              <Badge variant={deck.isOptional ? 'accent' : 'outline'}>
                {deck.isOptional ? 'Yes' : 'No'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/courses/${courseId}/decks/${deck.id}/cards/bulk`}>
                    Import Cards
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/courses/${courseId}/decks/${deck.id}/edit`}>Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isPending}>
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete &quot;{deck.name}&quot;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This deletes the deck and all its cards. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(deck.id)}
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
