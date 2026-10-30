
"use client";

import { useActionState } from "react";
import {
  updateMembershipStatus,
  type MembershipActionState,
} from "@/app/admin/members/actions";

const initialState: MembershipActionState = {
  message: "",
  error: false,
};

export default function MembershipReviewForm({
  memberId,
}: {
  memberId: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateMembershipStatus,
    initialState
  );

  return (
    <div className="min-w-0">
      <form action={formAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="memberId" value={memberId} />

        <button
          type="submit"
          name="status"
          value="approved"
          disabled={pending}
          className="button-primary min-h-10 px-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "SAVING..." : "APPROVE"}
        </button>

        <button
          type="submit"
          name="status"
          value="rejected"
          disabled={pending}
          className="button-secondary min-h-10 px-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          REJECT
        </button>
      </form>

      {state.message && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-2 text-xs leading-5 ${
            state.error ? "text-[#87423D]" : "text-[#756B61]"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
