"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LuGlobe,
  LuKey,
  LuLock,
  LuMegaphone,
  LuShieldAlert,
  LuTrash2,
  LuTriangleAlert,
  LuUserRound,
} from "react-icons/lu";
import {
  changeAccountPassword,
  deleteAccountAction,
  type PasswordChangeInput,
} from "@/app/actions/dashboard";
import { Badge, Button, Field, Modal, Notice, TextInput } from "@/components/ui";
import { DetailList } from "@/components/dashboard/DashboardParts";

export interface InfluencerProfileData {
  fullName: string;
  stageName: string | null;
  email: string;
  phone: string;
  creatorId: string;
  city: string | null;
  country: string | null;
  primaryPlatform: string;
  profileUrl: string;
  followerCount: string;
  engagementRate: string | null;
  targetNiche: string;
  collaborationDeliverables: string;
  submittedAt: string;
  status: string | null;
  promoCode: string;
  mediaPassNumber: string;
}

export function InfluencerProfileHub({
  initial,
  readOnly = false,
}: {
  initial: InfluencerProfileData;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [profile] = useState<InfluencerProfileData>(initial);

  // Password Change State
  const [passwordDraft, setPasswordDraft] = useState<PasswordChangeInput>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});
  const [passwordPending, startPasswordTransition] = useTransition();

  // Danger Zone / Account Deletion State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletePending, startDeleteTransition] = useTransition();

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordFieldErrors({});
    setPasswordSuccess(false);

    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    startPasswordTransition(async () => {
      const res = await changeAccountPassword(passwordDraft);
      if (!res.success) {
        setPasswordError(res.error ?? "Failed to change password.");
        setPasswordFieldErrors(res.fieldErrors ?? {});
        return;
      }
      setPasswordSuccess(true);
      setPasswordDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
    });
  }

  function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");
    if (deleteConfirmationText.trim() !== "DELETE") {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    startDeleteTransition(async () => {
      const res = await deleteAccountAction(deleteConfirmationText.trim());
      if (!res.success) {
        setDeleteError(res.error ?? "Failed to delete account. Please try again or contact support.");
        return;
      }
      window.location.href = "/?account_deleted=1";
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ---------- Section 1: Creator & Channel Details ---------- */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Channel Information
            </span>
            <h2 className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900 flex items-center gap-2">
              <LuMegaphone className="h-5 w-5 text-brand-red" aria-hidden />
              <span>Creator Profile & Media Accreditation</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-red-light px-3 py-1 font-mono text-xs font-bold text-brand-red-dark">
              Ref: {profile.creatorId}
            </span>
            <Badge tone="info">Pass: {profile.mediaPassNumber}</Badge>
          </div>
        </div>

        <div className="mt-5">
          <DetailList
            rows={[
              { label: "Legal Full Name", value: profile.fullName },
              { label: "Handle / Stage Name", value: profile.stageName || "—" },
              { label: "Registered Email", value: profile.email },
              { label: "Contact Phone", value: profile.phone },
              { label: "Primary Platform", value: profile.primaryPlatform },
              {
                label: "Profile / Channel URL",
                value: (
                  <a
                    href={profile.profileUrl.startsWith("http") ? profile.profileUrl : `https://${profile.profileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-red hover:underline font-mono text-xs break-all flex items-center gap-1"
                  >
                    <span>{profile.profileUrl}</span>
                    <LuGlobe className="h-3 w-3 shrink-0" />
                  </a>
                ),
              },
              { label: "Follower Count", value: profile.followerCount },
              { label: "Engagement Rate", value: profile.engagementRate || "—" },
              { label: "Content Niche", value: profile.targetNiche },
              { label: "City & Region", value: `${profile.city || "Patna"}, ${profile.country || "India"}` },
              { label: "Assigned Promo Code", value: <span className="font-mono font-bold text-brand-red">{profile.promoCode}</span> },
              { label: "Accreditation Status", value: profile.status ? profile.status.toUpperCase() : "PENDING" },
            ]}
          />
        </div>
      </div>

      {/* ---------- Section 2: Account Login & Password Management ---------- */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="border-b border-charcoal-100 pb-4">
          <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            Security & Authentication
          </span>
          <h2 className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900 flex items-center gap-2 mt-0.5">
            <LuLock className="h-5 w-5 text-brand-red" aria-hidden />
            <span>Change Account Password</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Keep your account secure with a strong password. At least 8 characters with a mix of letters and numbers.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4 max-w-xl">
          {passwordSuccess ? (
            <Notice tone="success" title="Password Updated">
              Your password has been changed successfully. Use your new password the next time you sign in.
            </Notice>
          ) : null}

          {passwordError ? (
            <Notice tone="error" title="Password update failed">
              {passwordError}
            </Notice>
          ) : null}

          <Field label="Current Password" error={passwordFieldErrors.currentPassword} required>
            <TextInput
              type="password"
              autoComplete="current-password"
              placeholder="Enter your current password"
              value={passwordDraft.currentPassword}
              onChange={(e) => setPasswordDraft({ ...passwordDraft, currentPassword: e.target.value })}
              required
              disabled={passwordPending || readOnly}
            />
          </Field>

          <Field
            label="New Password"
            hint="Minimum 8 characters"
            error={passwordFieldErrors.newPassword}
            required
          >
            <TextInput
              type="password"
              autoComplete="new-password"
              placeholder="Enter your new password"
              value={passwordDraft.newPassword}
              onChange={(e) => setPasswordDraft({ ...passwordDraft, newPassword: e.target.value })}
              required
              disabled={passwordPending || readOnly}
            />
          </Field>

          <Field
            label="Confirm New Password"
            error={passwordFieldErrors.confirmPassword}
            required
          >
            <TextInput
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your new password"
              value={passwordDraft.confirmPassword}
              onChange={(e) => setPasswordDraft({ ...passwordDraft, confirmPassword: e.target.value })}
              required
              disabled={passwordPending || readOnly}
            />
          </Field>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={LuKey}
              loading={passwordPending}
              disabled={
                passwordPending ||
                readOnly ||
                !passwordDraft.currentPassword ||
                passwordDraft.newPassword.length < 8 ||
                passwordDraft.newPassword !== passwordDraft.confirmPassword
              }
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* ---------- Section 3: Danger Zone / Account Deletion ---------- */}
      <div className="rounded-card border border-red-200 bg-red-50/40 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-barlow text-lg font-bold text-red-900 flex items-center gap-2">
              <LuShieldAlert className="h-5 w-5 text-brand-red" aria-hidden />
              <span>Danger Zone: Withdraw & Delete Account</span>
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-700 max-w-xl leading-relaxed">
              Permanently delete your influencer profile, accreditation passes, and login credentials. This action is irreversible.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={LuTrash2}
            className="border-red-300 text-red-700 hover:bg-red-100 shrink-0 self-start sm:self-center"
            onClick={() => {
              setDeleteConfirmationText("");
              setDeleteError("");
              setDeleteConfirmOpen(true);
            }}
            disabled={readOnly}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Irreversible Account Deletion"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-xs text-charcoal-600">
            Deleting your account removes all creator records, media passes, and promo codes from our database.
          </p>
          <div className="rounded-btn border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <LuTriangleAlert className="h-4 w-4 shrink-0 text-brand-red" />
              <span>Warning: This action cannot be undone.</span>
            </p>
            <p>
              Your creator profile, active press credentials, and audience discount codes will be permanently deleted.
            </p>
          </div>

          {deleteError ? <Notice tone="error">{deleteError}</Notice> : null}

          <Field
            label='Type "DELETE" to confirm'
            hint="Please type DELETE in capital letters to confirm permanent account removal"
            required
          >
            <TextInput
              placeholder="DELETE"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              disabled={deletePending}
              autoFocus
              required
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteConfirmationText("");
                setDeleteError("");
              }}
              disabled={deletePending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="md"
              icon={LuTrash2}
              className="border-red-300 text-red-700 hover:bg-red-100"
              loading={deletePending}
              disabled={
                deletePending ||
                deleteConfirmationText.trim() !== "DELETE"
              }
            >
              Permanently Delete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
