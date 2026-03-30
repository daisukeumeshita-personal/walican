import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(1, 'グループ名を入力してください').max(50, 'グループ名は50文字以内で入力してください'),
  description: z.string().max(200, '説明は200文字以内で入力してください').optional(),
})

export const addMemberSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type AddMemberInput = z.infer<typeof addMemberSchema>
