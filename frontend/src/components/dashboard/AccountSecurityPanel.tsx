"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuCheck, LuKey, LuLock, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import { changeAccountPassword, deleteAccountAction, type PasswordChangeInput } from "@/app/actions/dashboard";
import { Button, Field, Modal, Notice, TextInput } from "@/components/ui";

export function AccountSecurityPanel({ email }: { email: string }) {
  const router = useRouter();

  const [passwordDraft, setPasswordDraft] = useState<PasswordChangeInput>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordPending, startPasswordTransition] = useTransition();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletePending, startDeleteTransition] = useTransition();

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    startPasswordTransition(async () => {
      const res = await changeAccountPassword(passwordDraft);
      if (!res.success) {
        setPasswordError(res.error ?? "Failed to update password.");
        return;
      }
      setPasswordSuccess(true);
      setPasswordDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
    });
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm permanent removal.');
      return;
    }
    setDeleteError("");
    startDeleteTransition(async () => {
      const res = await deleteAccountAction(deleteConfirmText);
      if (!res.success) {
        setDeleteError(res.error ?? "Could not delete account.");
        return;
      }
      router.push("/login?deleted=1");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <LuLock className="h-5 w-5 text-brand-red" aria-hidden />
          <h3 className="text-lg font-extrabold text-charcoal-900">Account Security & Password</h3>
        </div>
        <p className="mb-4 text-sm text-charcoal-600">
          Signed in as <span className="font-semibold text-charcoal-900">{email}</span>. Update your password anytime.
        </p>

        {passwordError && (
          <Notice tone="error" className="mb-4">
            {passwordError}
          </Notice>
        )}
        {passwordSuccess && (
          <Notice tone="success" className="mb-4">
            <LuCheck className="inline h-4 w-4 mr-1" /> Password updated successfully.
          </Notice>
        )}

        <form onSubmit={handlePasswordChange} className="grid gap-4 md:grid-cols-3">
          <Field htmlFor="sec-cur" label="Current Password" required>
            <TextInput
              id="sec-cur"
              type="password"
              value={passwordDraft.currentPassword}
              onChange={(e) => setPasswordDraft((d) => ({ ...d, currentPassword: e.target.value }))}
              required
            />
          </Field>
          <Field htmlFor="sec-new" label="New Password" required>
            <TextInput
              id="sec-new"
              type="password"
              value={passwordDraft.newPassword}
              onChange={(e) => setPasswordDraft((d) => ({ ...d, newPassword: e.target.value }))}
              minLength={8}
              required
            />
          </Field>
          <Field htmlFor="sec-confirm" label="Confirm New Password" required>
            <TextInput
              id="sec-confirm"
              type="password"
              value={passwordDraft.confirmPassword}
              onChange={(e) => setPasswordDraft((d) => ({ ...d, confirmPassword: e.target.value }))}
              minLength={8}
              required
            />
          </Field>
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" variant="secondary" icon={LuKey} disabled={passwordPending}>
              {passwordPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-card border border-red-200 bg-red-50/40 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-red-900">
              <LuTriangleAlert className="h-5 w-5 text-red-600" aria-hidden />
              Delete Organization Account
            </h3>
            <p className="mt-1 text-sm text-red-800/80">
              Permanently deletes your login account and profile. This action cannot be undone.
            </p>
          </div>
          <Button type="button" variant="primary" icon={LuTrash2} onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </div>
      </section>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Account Deletion">
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-sm text-charcoal-600">
            This will permanently delete your organization account from Rajgir Marathon. Type{" "}
            <strong className="text-charcoal-900">DELETE</strong> to confirm.
          </p>
          {deleteError && <Notice tone="error">{deleteError}</Notice>}
          <Field htmlFor="del-confirm" label='Type "DELETE"' required>
            <TextInput
              id="del-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={deletePending}>
              {deletePending ? "Deleting..." : "Permanently Delete"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
