"use client";

import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { FormActions, FormField, FormSection } from "@/components/admin/form-fields";

export function PasswordForm({ email }: { email: string }) {
  // Bumped after a successful change: remounting the form clears the typed passwords.
  const [round, setRound] = useState(0);

  return (
    <ActionForm
      key={round}
      action={changePassword}
      onSuccess={(state) => {
        toast.success(state.message ?? "密码已修改");
        setRound((n) => n + 1);
      }}
      className="space-y-6"
    >
      {/* Tells password managers which account the new password belongs to. */}
      <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />

      <FormSection title="修改密码" description={`当前账号：${email}`}>
        <FormField label="当前密码" name="currentPassword" type="password" required autoComplete="current-password" />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="新密码"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            description="至少 8 个字符。几个不相关的词连在一起，好记又难猜。"
          />
          <FormField label="确认新密码" name="confirmPassword" type="password" required autoComplete="new-password" />
        </div>
      </FormSection>

      <FormActions cancelHref="/admin" submitLabel="修改密码" />
    </ActionForm>
  );
}
