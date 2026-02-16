'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { createCourseSchema, updateCourseSchema } from '@/lib/schemas/course'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export type CourseActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createCourse(
  _prevState: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  const admin = await requireAdmin()

  const raw = Object.fromEntries(formData.entries())
  const result = createCourseSchema.safeParse(raw)

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const data = result.data

  try {
    await prisma.course.create({
      data: {
        name: data.name,
        description: data.description || null,
        subject: data.subject || null,
        level: data.level || null,
        estimatedHours: data.estimatedHours ?? null,
        isPublished: data.isPublished,
        createdById: admin.id!,
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'A course with that name already exists.' }
    }
    throw e
  }

  redirect('/admin/courses')
}

export async function updateCourse(
  _prevState: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  await requireAdmin()

  const raw = Object.fromEntries(formData.entries())
  const result = updateCourseSchema.safeParse(raw)

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { id, ...data } = result.data

  try {
    await prisma.course.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        subject: data.subject || null,
        level: data.level || null,
        estimatedHours: data.estimatedHours ?? null,
        isPublished: data.isPublished,
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'A course with that name already exists.' }
    }
    throw e
  }

  redirect('/admin/courses')
}

export async function deleteCourse(id: string) {
  await requireAdmin()
  await prisma.course.delete({ where: { id } })
  revalidatePath('/admin/courses')
}

export async function getCourses() {
  await requireAdmin()
  return prisma.course.findMany({
    include: {
      _count: {
        select: { decks: true, enrollments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCourse(id: string) {
  await requireAdmin()
  return prisma.course.findUnique({
    where: { id },
    include: {
      decks: {
        orderBy: { ordinal: 'asc' },
        include: {
          _count: { select: { cards: true } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  })
}
