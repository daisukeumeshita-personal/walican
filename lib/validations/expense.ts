import { z } from 'zod'

export const createExpenseSchema = z.object({
  description: z.string().min(1, '内容を入力してください').max(100, '100文字以内で入力してください'),
  amount: z.number().int('整数で入力してください').positive('金額は1円以上で入力してください'),
  paidBy: z.string().uuid('支払者を選択してください'),
  splitMethod: z.enum(['equal', 'exact', 'percentage']),
  splits: z.array(z.object({
    userId: z.string().uuid(),
    amount: z.number().int(),
    percentage: z.number().optional(),
  })),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
