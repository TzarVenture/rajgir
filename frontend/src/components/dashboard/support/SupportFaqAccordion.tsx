"use client";

import { useId, useMemo, useState } from "react";
import { LuChevronDown, LuCircleHelp, LuSearch } from "react-icons/lu";
import { RUNNER_CATEGORIES, RUNNER_FAQS, type SupportFaq } from "@/lib/supportData";
import { TextInput } from "@/components/ui";

export function SupportFaqAccordion({
  limit,
  faqs = RUNNER_FAQS,
  categories = RUNNER_CATEGORIES,
  searchPlaceholder = "Search help topics (e.g. proxy pickup, bag drop, RFID chip, invoice)...",
  onSelectTopic,
}: {
  limit?: number;
  faqs?: SupportFaq[];
  categories?: readonly { id: string; label: string }[];
  searchPlaceholder?: string;
  onSelectTopic?: (topicId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const filtered = useMemo(() => {
    let list = faqs;
    if (selectedCat !== "all") {
      list = list.filter((f) => f.category === selectedCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.categoryLabel.toLowerCase().includes(q)
      );
    }
    return limit ? list.slice(0, limit) : list;
  }, [faqs, search, selectedCat, limit]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-11 pl-10 pr-4 rounded-btn border border-charcoal-300 bg-white text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
          />
        </div>

        {!limit && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCat === cat.id
                    ? "bg-brand-red text-white shadow-2xs"
                    : "border border-charcoal-200 bg-white text-charcoal-600 hover:border-charcoal-300 hover:text-charcoal-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Accordion Items */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-charcoal-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-charcoal-900">No matching help topics found</p>
          <p className="mt-1 text-xs text-charcoal-500">
            Cannot find what you are looking for? Submit a ticket directly to race operations below.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-card border border-charcoal-200 bg-white transition-all hover:border-charcoal-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left font-semibold text-charcoal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="mt-0.5 inline-block shrink-0 rounded-full bg-brand-red-light px-2 py-0.5 text-[10px] font-bold text-brand-red-dark">
                      {faq.categoryLabel}
                    </span>
                    <span className="text-sm break-words">{faq.question}</span>
                  </div>
                  <LuChevronDown
                    className={`h-4 w-4 shrink-0 text-charcoal-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-red" : ""
                    }`}
                    aria-hidden
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-charcoal-100 bg-surface-soft p-4 text-xs sm:text-sm leading-relaxed text-charcoal-700 break-words whitespace-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
