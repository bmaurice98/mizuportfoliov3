import Link from "next/link";
import React from "react";

type Props = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const InquiriesCard = ({ name, email, subject, message }: Props) => {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-white/3 backdrop-blur-[32px] border border-white/10 hover:bg-white/8 hover:backdrop-blur-3xl hover:border-white/40 transition-all duration-500 flex flex-col min-h-120">
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none rounded-xl"></div>

      <div className="p-6 flex flex-col grow z-10">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
          {name || ""}
        </h3>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
          {email || ""}
        </h3>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
          {subject || ""}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6 grow">
          {message || ""}
        </p>
      </div>
    </article>
  );
};

export default InquiriesCard;
