"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LuKey,
  LuLock,
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

export interface VolunteerProfileData {
  fullName: string;
  email: string;
  phone: string;
  volunteerId: string;
  rolePreference: string;
  assignedRole: string | null;
  assignedStation: string | null;
  assignedSector: string | null;
  supervisorName: string | null;
  supervisorPhone: string | null;
  shiftLabel: string | null;
  tshirtSize: string;
  languagesSpoken: string | null;
  dietaryRestrictions: string | null;
  medicalCertification: boolean | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  submittedAt: string;
  status: string | null;
}

export function VolunteerProfileHub({
  initial,
  readOnly = false,
}: {
  initial: VolunteerProfileData;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [profile] = useState<VolunteerProfileData>(initial);

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

  // Delete Account State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletePending, startDeleteTransition] = useTransition();

  // Password Change Handlers
  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordFieldErrors({});

    startPasswordTransition(async () => {
      const res = await changeAccountPassword(passwordDraft);
      if (!res.success) {
        setPasswordError(res.error ?? "We could not update your password.");
        setPasswordFieldErrors(res.fieldErrors ?? {});
        return;
      }

      setPasswordSuccess(true);
      setPasswordDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 5000);
    });
  }

  // Delete Account Handler
  function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");

    startDeleteTransition(async () => {
      const res = await deleteAccountAction(deleteConfirmText);
      if (!res.success) {
        setDeleteError(res.error ?? "We could not delete your account.");
        return;
      }
      // On success, session is destroyed and we redirect to home
      window.location.href = "/?account_deleted=1";
    });
  }

  return (
    <div className="space-y-8">
      {/* 1. Volunteer Crew Profile Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="border-b border-charcoal-200 pb-4">
          <h2 className="font-barlow text-xl font-bold text-charcoal-900 flex items-center gap-2">
            <LuUserRound className="h-5 w-5 text-brand-red" aria-hidden />
            <span>Volunteer Crew Profile Details</span>
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
            Registered crew credentials, contact information, and kit specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailList
            rows={[
              { label: "Full Name", value: profile.fullName },
              { label: "Primary Email", value: <span className="break-all">{profile.email}</span> },
              { label: "Mobile Phone", value: <span className="font-mono">+91 {profile.phone}</span> },
              {
                label: "Crew T-Shirt Size",
                value: (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900">Size {profile.tshirtSize}</span>
                    <Badge tone="brand">Issued in Crew Kit</Badge>
                  </div>
                ),
              },
              { label: "Languages Spoken", value: profile.languagesSpoken ?? "Hindi, English" },
            ]}
          />

          <DetailList
            rows={[
              {
                label: "Assigned Role",
                value: profile.assignedRole ?? profile.rolePreference,
              },
              {
                label: "Station & Sector",
                value: profile.assignedStation
                  ? `${profile.assignedStation}${profile.assignedSector ? ` (Sector ${profile.assignedSector})` : ""}`
                  : "Assigned before race week",
              },
              {
                label: "First-Aid / CPR Certified",
                value: profile.medicalCertification ? (
                  <Badge tone="success">Certified First Responder</Badge>
                ) : (
                  "Standard Crew"
                ),
              },
              {
                label: "Emergency Contact",
                value: `${profile.emergencyContactName} (+91 ${profile.emergencyContactPhone})`,
              },
              {
                label: "Dietary Preferences",
                value: profile.dietaryRestrictions ?? "None specified",
              },
            ]}
          />
        </div>

        <div className="rounded-btn bg-surface-soft p-3 text-xs text-charcoal-600 border border-charcoal-200">
          <p>
            <span className="font-semibold text-charcoal-800">Fixed Operational Parameters:</span> Your volunteer role, allotted station, and shift timings are coordinated centrally by Race Operations Control to maintain volunteer safety coverage. For urgent station reassignments or emergency schedule adjustments, contact your supervisor or the volunteer desk.
          </p>
        </div>
      </div>

      {/* 2. Security & Password Update Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="border-b border-charcoal-200 pb-4">
          <h2 className="font-barlow text-xl font-bold text-charcoal-900 flex items-center gap-2">
            <LuLock className="h-5 w-5 text-brand-red" aria-hidden />
            <span>Account Security & Password</span>
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
            Update your login credentials. Use a strong password containing at least 8 characters.
          </p>
        </div>

        {passwordSuccess && (
          <Notice tone="success" title="Password changed successfully">
            Your login password has been updated. Use this new password on your subsequent sign-ins.
          </Notice>
        )}

        {passwordError && (
          <Notice tone="error" title="Could not change password">
            {passwordError}
          </Notice>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <Field
            label="Current Password"
            hint="Enter your existing account password (optional if set via social or OTP)"
            error={passwordFieldErrors.currentPassword}
          >
            <TextInput
              type="password"
              value={passwordDraft.currentPassword ?? ""}
              onChange={(e) => setPasswordDraft((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="••••••••"
              disabled={passwordPending}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="New Password"
              hint="Minimum 8 characters"
              error={passwordFieldErrors.newPassword}
              required
            >
              <TextInput
                type="password"
                value={passwordDraft.newPassword}
                onChange={(e) => setPasswordDraft((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="••••••••"
                disabled={passwordPending}
                required
              />
            </Field>

            <Field
              label="Confirm New Password"
              hint="Re-type new password"
              error={passwordFieldErrors.confirmPassword}
              required
            >
              <TextInput
                type="password"
                value={passwordDraft.confirmPassword}
                onChange={(e) => setPasswordDraft((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                disabled={passwordPending}
                required
              />
            </Field>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={LuKey}
              loading={passwordPending}
              disabled={passwordPending || !passwordDraft.newPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Danger Zone: Delete Account */}
      <div className="rounded-card border border-red-200 bg-red-50/40 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-barlow text-xl font-bold text-red-700 flex items-center gap-2">
              <LuShieldAlert className="h-5 w-5 text-red-600" aria-hidden />
              <span>Danger Zone: Delete Account</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-charcoal-700 max-w-xl">
              Permanently delete your user account and withdraw your volunteer registration (<strong>{profile.volunteerId}</strong>). This removes your digital accreditation pass, forfeits kit pickup, and wipes service attendance history. This action is irreversible.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={LuTrash2}
            className="border-red-300 text-red-700 hover:bg-red-100 shrink-0 self-start sm:self-center"
            onClick={() => {
              setDeleteConfirmText("");
              setDeleteError("");
              setDeleteOpen(true);
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Permanently Delete Account?"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-xs text-charcoal-600 mb-2">
            This action cannot be undone. All your volunteer records, credentials, and account access will be permanently erased.
          </p>
          <Notice tone="error" title="Warning: Immediate cancellation">
            Deleting your account will withdraw your registration as a volunteer (Ref: <strong>{profile.volunteerId}</strong>). You will not be able to collect your crew kit or serve on race day.
          </Notice>

          {deleteError && (
            <Notice tone="error" title="Account deletion failed">
              {deleteError}
            </Notice>
          )}

          <Field
            label='Type "DELETE" to confirm'
            hint="Please type DELETE in capital letters to confirm permanent account removal"
            required
          >
            <TextInput
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={deletePending}
              autoFocus
              required
            />
          </Field>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-charcoal-200">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setDeleteOpen(false)}
              disabled={deletePending}
            >
              Keep My Account
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={LuTriangleAlert}
              className="bg-red-600 text-white hover:bg-red-700"
              loading={deletePending}
              disabled={deletePending || deleteConfirmText.trim() !== "DELETE"}
            >
              Permanently Delete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
