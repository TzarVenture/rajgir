import { LuLock, LuShieldCheck } from "react-icons/lu";
import { Card } from "./Card";

/** The name / email / mobile taken from the account, shown read-only at the top of registration forms. */
export function AccountSummary({
  name,
  email,
  phone,
  title = "Your account",
  hidePhone = false,
}: {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  /** Hide the mobile column when the form has its own editable mobile field. */
  hidePhone?: boolean;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-charcoal-200 pb-3">
        <div className="flex items-center gap-2">
          <LuShieldCheck className="h-5 w-5 text-[#15803D]" aria-hidden />
          <h2 className="text-sm font-bold text-charcoal-900">{title}</h2>
        </div>
        <span className="flex items-center gap-1 text-xs text-charcoal-500">
          <LuLock className="h-3.5 w-3.5" aria-hidden /> Taken from your account
        </span>
      </div>
      <dl className={hidePhone ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "grid grid-cols-1 gap-3 sm:grid-cols-3"}>
        <div className="min-w-0">
          <dt className="text-xs font-semibold text-charcoal-500">Name</dt>
          <dd className="truncate text-sm font-semibold text-charcoal-900">{name}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-semibold text-charcoal-500">Email</dt>
          <dd className="truncate text-sm font-semibold text-charcoal-900">{email}</dd>
        </div>
        {hidePhone ? null : (
          <div className="min-w-0">
            <dt className="text-xs font-semibold text-charcoal-500">Mobile</dt>
            <dd className="truncate text-sm font-semibold text-charcoal-900">{phone || "Not added"}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
