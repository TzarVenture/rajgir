"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LuCheck,
  LuKey,
  LuLock,
  LuPencil,
  LuShieldAlert,
  LuTrash2,
  LuTriangleAlert,
  LuUserRound,
} from "react-icons/lu";
import {
  updateRunnerProfile,
  changeAccountPassword,
  deleteAccountAction,
  type RunnerProfileInput,
  type PasswordChangeInput,
} from "@/app/actions/dashboard";
import { Button, Field, Modal, Notice, Select, TextInput } from "@/components/ui";
import { DetailList } from "@/components/dashboard/DashboardParts";

const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export interface RunnerProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bibName: string;
  tshirtSize: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  runningClub: string;
  registrationNumber: string;
  distance: string;
  raceTitle: string;
  dateOfBirth: string;
  gender: string;
}

export function RunnerProfileHub({
  initial,
  readOnly = false,
}: {
  initial: RunnerProfileData;
  readOnly?: boolean;
}) {
  const router = useRouter();

  // Profile Edit State
  const [profile, setProfile] = useState<RunnerProfileData>(initial);
  const [draft, setDraft] = useState<RunnerProfileInput>({
    firstName: initial.firstName,
    lastName: initial.lastName,
    phone: initial.phone,
    bibName: initial.bibName,
    tshirtSize: initial.tshirtSize as "M",
    city: initial.city,
    state: initial.state,
    pincode: initial.pincode,
    country: initial.country,
    runningClub: initial.runningClub,
  });
  const [editOpen, setEditOpen] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [profilePending, startProfileTransition] = useTransition();

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

  // Profile Edit Handlers
  function openProfileEditor() {
    setDraft({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      bibName: profile.bibName,
      tshirtSize: profile.tshirtSize as "M",
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      country: profile.country,
      runningClub: profile.runningClub,
    });
    setProfileError("");
    setFieldErrors({});
    setEditOpen(true);
  }

  function handleProfileChange<K extends keyof RunnerProfileInput>(key: K, value: RunnerProfileInput[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);

    startProfileTransition(async () => {
      const res = await updateRunnerProfile(draft);
      if (!res.success) {
        setProfileError(res.error ?? "Failed to save profile changes.");
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }

      setProfile((prev) => ({
        ...prev,
        firstName: draft.firstName,
        lastName: draft.lastName,
        phone: draft.phone,
        bibName: draft.bibName,
        tshirtSize: draft.tshirtSize,
        city: draft.city,
        state: draft.state,
        pincode: draft.pincode,
        country: draft.country ?? "India",
        runningClub: draft.runningClub ?? "",
      }));
      setProfileSuccess(true);
      setEditOpen(false);
      router.refresh();
      setTimeout(() => setProfileSuccess(false), 4000);
    });
  }

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
      {profileSuccess && (
        <Notice tone="success" title="Profile updated successfully">
          Your athlete details and bib configuration have been saved.
        </Notice>
      )}

      {/* 1. Athlete Information Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-charcoal-200 pb-4">
          <div>
            <h2 className="font-barlow text-xl font-bold text-charcoal-900 flex items-center gap-2">
              <LuUserRound className="h-5 w-5 text-brand-red" aria-hidden />
              <span>Athlete Profile Details</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
              Personal athlete profile, communication phone number, and kit preferences.
            </p>
          </div>
          {!readOnly && (
            <Button variant="secondary" size="md" icon={LuPencil} onClick={openProfileEditor}>
              Edit Details
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailList
            rows={[
              { label: "Full Name", value: `${profile.firstName} ${profile.lastName}` },
              { label: "Primary Email", value: <span className="break-all">{profile.email}</span> },
              { label: "Mobile Phone", value: <span className="font-mono">+91 {profile.phone}</span> },
              { label: "Name on Bib Pass", value: <span className="font-mono font-bold text-brand-red">{profile.bibName}</span> },
              { label: "Event T-Shirt Size", value: <span className="font-semibold">Size {profile.tshirtSize}</span> },
            ]}
          />

          <DetailList
            rows={[
              { label: "Registered Race", value: `${profile.distance} ${profile.raceTitle}` },
              { label: "City & State", value: `${profile.city}, ${profile.state}` },
              { label: "Postal PIN Code", value: profile.pincode },
              { label: "Country", value: profile.country || "India" },
              { label: "Running Club", value: profile.runningClub || "Independent Athlete" },
            ]}
          />
        </div>

        <div className="rounded-btn bg-surface-soft p-3 text-xs text-charcoal-600 border border-charcoal-200">
          <p>
            <span className="font-semibold text-charcoal-800">Fixed Race Parameters:</span> Your registered category (<strong>{profile.distance}</strong>), date of birth, and gender determine official category rankings and cannot be modified self-serve. For official category upgrades or corrections, please reach out to the race help desk.
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

      {/* 3. Danger Zone: Delete Account & Cancel Registration */}
      <div className="rounded-card border border-red-200 bg-red-50/40 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-barlow text-xl font-bold text-red-700 flex items-center gap-2">
              <LuShieldAlert className="h-5 w-5 text-red-600" aria-hidden />
              <span>Danger Zone: Delete Account</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-charcoal-700 max-w-xl">
              Permanently delete your user account and withdraw your runner registration (<strong>{profile.registrationNumber}</strong>). This removes your digital bib pass, forfeits kit pickup, and wipes race history. This action is irreversible.
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

      {/* Edit Profile Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Athlete Profile"
      >
        <form onSubmit={saveProfile} className="space-y-4">
          <p className="text-xs text-charcoal-600 mb-2">
            Update your personal athlete profile, contact number, and kit pickup preferences.
          </p>
          {profileError && (
            <Notice tone="error" title="Please check the form">
              {profileError}
            </Notice>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" error={fieldErrors.firstName} required>
              <TextInput
                value={draft.firstName}
                onChange={(e) => handleProfileChange("firstName", e.target.value)}
                disabled={profilePending}
                required
              />
            </Field>

            <Field label="Last Name" error={fieldErrors.lastName} required>
              <TextInput
                value={draft.lastName}
                onChange={(e) => handleProfileChange("lastName", e.target.value)}
                disabled={profilePending}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Mobile Phone"
              hint="10 digits (without +91)"
              error={fieldErrors.phone}
              required
            >
              <TextInput
                type="tel"
                inputMode="numeric"
                value={draft.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                disabled={profilePending}
                required
              />
            </Field>

            <Field
              label="Name on Bib Pass"
              hint="Printed on your bib"
              error={fieldErrors.bibName}
              required
            >
              <TextInput
                value={draft.bibName}
                onChange={(e) => handleProfileChange("bibName", e.target.value.toUpperCase())}
                maxLength={20}
                disabled={profilePending}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Event T-Shirt Size"
              hint="Official souvenir t-shirt"
              error={fieldErrors.tshirtSize}
              required
            >
              <Select
                value={draft.tshirtSize}
                onChange={(e) => handleProfileChange("tshirtSize", e.target.value as "M")}
                disabled={profilePending}
              >
                {TSHIRT_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    Size {sz}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Running Club" hint="Club, team, or independent" error={fieldErrors.runningClub}>
              <TextInput
                value={draft.runningClub ?? ""}
                onChange={(e) => handleProfileChange("runningClub", e.target.value)}
                placeholder="e.g. Patna Striders"
                disabled={profilePending}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="City" error={fieldErrors.city} required>
              <TextInput
                value={draft.city}
                onChange={(e) => handleProfileChange("city", e.target.value)}
                disabled={profilePending}
                required
              />
            </Field>

            <Field label="State" error={fieldErrors.state} required>
              <TextInput
                value={draft.state}
                onChange={(e) => handleProfileChange("state", e.target.value)}
                disabled={profilePending}
                required
              />
            </Field>

            <Field label="PIN Code" error={fieldErrors.pincode} required>
              <TextInput
                value={draft.pincode}
                onChange={(e) => handleProfileChange("pincode", e.target.value)}
                maxLength={6}
                disabled={profilePending}
                required
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-charcoal-200">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setEditOpen(false)}
              disabled={profilePending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={LuCheck}
              loading={profilePending}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Permanently Delete Account?"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-xs text-charcoal-600 mb-2">
            This action cannot be undone. All your race entries and runner data will be permanently erased.
          </p>
          <Notice tone="error" title="Warning: Immediate cancellation">
            Deleting your account will forfeit your entry for the <strong>{profile.distance} {profile.raceTitle}</strong> (Reg. No: <strong>{profile.registrationNumber}</strong>). You will not be able to collect your kit at the expo or participate on race day.
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
