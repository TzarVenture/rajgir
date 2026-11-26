"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowRight, LuGraduationCap } from "react-icons/lu";
import { AppUser } from "@/lib/auth/session";
import { submitSchoolRegistration } from "@/app/actions/registerGroup";
import { AccountSummary, Button, Checkbox, Field, FormSection, Notice, Select, TextInput } from "@/components/ui";

interface SchoolRegisterFormProps {
  user: AppUser;
}

export default function SchoolRegisterForm({ user }: SchoolRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    schoolName: "",
    boardAffiliation: "CBSE",
    city: "",
    teacherInCharge: user.name || "",
    teacherDesignation: "Sports Director / Physical Education Head",
    estimatedStudents: 50,
    parentalConsentAgreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.schoolName.trim()) {
      setError("Please provide the institution or school name.");
      return;
    }
    if (!formData.city.trim()) {
      setError("Please provide the city where the school is located.");
      return;
    }
    if (!formData.teacherInCharge.trim()) {
      setError("Please specify the Teacher / Coordinator in charge.");
      return;
    }
    if (formData.estimatedStudents < 5) {
      setError("School contingents require at least 5 participating students.");
      return;
    }
    if (!formData.parentalConsentAgreed) {
      setError("You must confirm that parental and institutional consent will be secured for all minor participants.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSchoolRegistration({
        schoolName: formData.schoolName.trim(),
        boardAffiliation: formData.boardAffiliation.trim(),
        city: formData.city.trim(),
        teacherInCharge: formData.teacherInCharge.trim(),
        teacherDesignation: formData.teacherDesignation.trim(),
        estimatedStudents: Number(formData.estimatedStudents),
        parentalConsentAgreed: formData.parentalConsentAgreed,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit institutional registration.");
      }

      router.push("/pending");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}

      <AccountSummary name={user.name} email={user.email} phone={user.phone} title="Institutional coordinator" />

      <FormSection icon={LuGraduationCap} title="School or college information" description="Tell us about the institution and who is leading the contingent.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="School / college name" htmlFor="school-name" required>
            <TextInput
              id="school-name"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="e.g. St. Xavier's High School / Nalanda College"
            />
          </Field>
          <Field label="Board / university affiliation" htmlFor="school-board" required>
            <Select
              id="school-board"
              value={formData.boardAffiliation}
              onChange={(e) => setFormData({ ...formData, boardAffiliation: e.target.value })}
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE / ISC">ICSE / ISC</option>
              <option value="Bihar State Board (BSEB)">Bihar State Board (BSEB)</option>
              <option value="State University / UGC">State University / UGC</option>
              <option value="Autonomous / Other">Autonomous / Other</option>
            </Select>
          </Field>
          <Field label="City / location" htmlFor="school-city" required>
            <TextInput
              id="school-city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Rajgir, Nalanda, Patna"
            />
          </Field>
          <Field label="Estimated student contingent" htmlFor="school-students" required hint="Minimum 5, maximum 50 students initially (you can appeal to Admin for 50+ later).">
            <TextInput
              id="school-students"
              type="number"
              min={5}
              max={50}
              required
              value={formData.estimatedStudents}
              onChange={(e) => setFormData({ ...formData, estimatedStudents: Math.min(50, parseInt(e.target.value) || 5) })}
            />
          </Field>
          <Field label="Teacher / coordinator in charge" htmlFor="school-teacher" required>
            <TextInput
              id="school-teacher"
              required
              value={formData.teacherInCharge}
              onChange={(e) => setFormData({ ...formData, teacherInCharge: e.target.value })}
              placeholder="e.g. Anand Kumar"
            />
          </Field>
          <Field label="Teacher designation" htmlFor="school-designation" required>
            <TextInput
              id="school-designation"
              required
              value={formData.teacherDesignation}
              onChange={(e) => setFormData({ ...formData, teacherDesignation: e.target.value })}
              placeholder="e.g. Sports Director / Principal"
            />
          </Field>
        </div>

        <div className="rounded-card bg-surface-soft p-4">
          <Checkbox
            required
            checked={formData.parentalConsentAgreed}
            onChange={(e) => setFormData({ ...formData, parentalConsentAgreed: e.target.checked })}
          >
            I declare that this registration is authorized by the school or college administration, and that written parental consent and
            medical fitness forms will be obtained for all student participants before race day.
          </Checkbox>
        </div>
      </FormSection>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
        {isSubmitting ? "Submitting registration" : "Submit school contingent"}
      </Button>
    </form>
  );
}
