'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/data/dummy-data";

// Define the schema for the form
const ruleFormSchema = z.object({
  name: z.string().min(2, { message: "ルール名は2文字以上で入力してください。" }),
  trigger_field: z.enum(["merchant", "amount"]),
  trigger_operator: z.enum(["contains", "equals", "greater_than", "less_than"]),
  trigger_value: z.string().min(1, { message: "条件値を入力してください。" }), // We'll handle number conversion later
  action_field: z.enum(["category"]),
  action_value: z.string({ required_error: "カテゴリを選択してください。" }),
});

export type RuleFormValues = z.infer<typeof ruleFormSchema>;

interface RuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onRuleAction will be used later to handle form submission
}

export function RuleForm({ open, onOpenChange }: RuleFormProps) {
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      name: "",
      trigger_field: "merchant",
      trigger_operator: "contains",
      action_field: "category",
    },
  });

  const onSubmit = (values: RuleFormValues) => {
    // This is where we'll handle the form submission logic in a future step.
    console.log(values);
    onOpenChange(false);
  };

  // For now, the form is just a placeholder UI.
  // The actual form fields will be added in the next step.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しい分類ルール</DialogTitle>
          <DialogDescription>
            特定の条件に一致する取引を自動的に分類するルールを作成します。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="rule-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ルール名</FormLabel>
                  <FormControl>
                    <Input placeholder="例: スターバックスのコーヒー代" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 rounded-md border p-4">
                <h4 className="font-medium">もし (If)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <FormField
                        control={form.control}
                        name="trigger_field"
                        render={({ field }) => (
                            <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="merchant">店名</SelectItem>
                                        <SelectItem value="amount">金額</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="trigger_operator"
                        render={({ field }) => (
                            <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="contains">を含む</SelectItem>
                                        <SelectItem value="equals">と等しい</SelectItem>
                                        <SelectItem value="greater_than">より大きい</SelectItem>
                                        <SelectItem value="less_than">より小さい</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="trigger_value"
                        render={({ field }) => (
                            <FormItem className="col-span-3 sm:col-span-1">
                                <FormControl>
                                    <Input placeholder="スターバックス" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                 <FormMessage>{form.formState.errors.trigger_value?.message}</FormMessage>
            </div>

            <div className="space-y-2 rounded-md border p-4">
                <h4 className="font-medium">ならば (Then)</h4>
                 <FormField
                    control={form.control}
                    name="action_value"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>カテゴリを次のように設定する:</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="カテゴリを選択..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {CATEGORIES.filter(c => c.key !== 'income').map(c => (
                                        <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </form>
        </Form>
         <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>キャンセル</Button>
            <Button type="submit" form="rule-form">ルールを保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
