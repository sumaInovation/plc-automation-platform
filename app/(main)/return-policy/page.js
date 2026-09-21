export const metadata = {
  title: "Return & Refund Policy | Suma Automation",
  description:
    "Return and refund policy for Suma Automation — electronic components, automation solutions, and technical training in Ganemulla, Sri Lanka.",
};

const specs = [
  { no: "01", label: "Return window", value: "7 days from delivery date" },
  { no: "02", label: "Item condition", value: "Unused, unopened, original seal intact" },
  { no: "03", label: "Return shipping", value: "Paid by customer" },
  { no: "04", label: "Refund method", value: "Bank transfer" },
  { no: "05", label: "Refund timeline", value: "3–5 business days after inspection" },
];

const nonReturnable = [
  "Items with a broken or opened seal",
  "Used, tested, or powered-on components",
  "Products damaged after delivery due to misuse",
  "Original delivery charges (non-refundable)",
];

const steps = [
  {
    no: "01",
    title: "Contact us",
    body: "Email or call us within 7 days of delivery with your order number and the reason for return.",
  },
  {
    no: "02",
    title: "We review",
    body: "We confirm the item qualifies — sealed, unused, and undamaged — and share a return address.",
  },
  {
    no: "03",
    title: "You ship it back",
    body: "Pack the item securely and send it at your own cost. Keep the tracking slip until the refund lands.",
  },
  {
    no: "04",
    title: "We inspect & refund",
    body: "Once received and checked, we process your refund by bank transfer within 3–5 business days.",
  },
];

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-[#16181C] text-[#EDEAE1]">
      {/* Header strip */}
      <div className="border-b border-[#2A2D33]">
        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
          <p className="font-mono text-xs tracking-wide text-[#C87F3B]">
            SUMA AUTOMATION · GANEMULLA, SRI LANKA
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#F5F2EA] sm:text-4xl">
            Return &amp; Refund Policy
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#A7A296]">
            We want every component, board, and kit to arrive exactly as
            ordered. If something isn&apos;t right, here is how returns work.
          </p>
        </div>
      </div>

      {/* Spec table */}
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
        <div className="overflow-hidden rounded-sm border border-[#2A2D33]">
          {specs.map((s, i) => (
            <div
              key={s.no}
              className={`flex items-center gap-4 px-5 py-4 ${
                i !== specs.length - 1 ? "border-b border-[#2A2D33]" : ""
              } ${i % 2 === 1 ? "bg-[#1B1E24]" : "bg-[#181A20]"}`}
            >
              <span className="font-mono text-xs text-[#C87F3B]">{s.no}</span>
              <span className="w-40 shrink-0 font-mono text-[13px] text-[#A7A296] sm:w-52">
                {s.label}
              </span>
              <span className="text-[15px] text-[#F5F2EA]">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Non-returnable */}
        <section className="mt-14">
          <p className="font-mono text-xs tracking-wide text-[#C87F3B]">
            NOT ELIGIBLE FOR RETURN
          </p>
          <ul className="mt-4 space-y-2 border-l border-[#2A2D33] pl-5">
            {nonReturnable.map((item) => (
              <li key={item} className="text-[15px] leading-relaxed text-[#CFCBBF]">
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* How to request a return */}
        <section className="mt-16">
          <p className="font-mono text-xs tracking-wide text-[#C87F3B]">
            HOW TO REQUEST A RETURN
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {steps.map((step) => (
              <div key={step.no} className="border-t border-[#2A2D33] pt-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-[#C87F3B]">
                    {step.no}
                  </span>
                  <h3 className="text-[15px] font-medium text-[#F5F2EA]">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#A7A296]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-16 rounded-sm border border-[#2A2D33] bg-[#1B1E24] p-6">
          <p className="text-[15px] text-[#F5F2EA]">
            Questions about a return? Reach us at{" "}
            <a
              href="mailto:info@sumaautomation.lk"
              className="text-[#C87F3B] underline underline-offset-4"
            >
              info@sumaautomation.lk
            </a>{" "}
            or call{" "}
            <a
              href="tel:+94787556865"
              className="text-[#C87F3B] underline underline-offset-4"
            >
              +94 78 755 6865
            </a>
            .
          </p>
        </section>

        <p className="mt-10 font-mono text-xs text-[#5C594F]">
          Suma Automation — Ganemulla, Sri Lanka. Policy last updated{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      </div>
    </main>
  );
}