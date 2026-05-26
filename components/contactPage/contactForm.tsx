"use client";
import React from "react";
import { createInquiry } from "@/app/actions";

import { useFormStatus } from "react-dom";

export default function ContactForm() {
  const { pending } = useFormStatus();

  return (
    <div className="lg:col-span-7">
      <div className="bg-white/3 backdrop-blur-[32px] border border-white/10 border-t-white/20 border-l-white/20 rounded-xl p-8 md:p-12">
        <form action={createInquiry} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* <!-- Name Input --> */}
            <div className="flex flex-col gap-2 relative group">
              <label
                className="font-label-caps text-label-caps text-on-surface-variant"
                id="name"
              >
                Entity Identifier / Name
              </label>
              <input
                className="bg-white/2 border-0 border-b border-white/20 focus:ring-0 focus:border-secondary focus:bg-white/6 text-primary placeholder-on-surface-variant/50 font-body-md text-body-md p-3 w-full outline-none transition-all duration-300"
                id="name"
                name="name"
                placeholder="Enter your designation"
                required={true}
                type="text"
              />
            </div>
            {/* <!-- Email Input --> */}
            <div className="flex flex-col gap-2 relative group">
              <label
                className="font-label-caps text-label-caps text-on-surface-variant"
                id="email"
              >
                Return Protocol / Email
              </label>
              <input
                className="bg-white/2 border-0 border-b border-white/20 focus:ring-0 focus:border-secondary focus:bg-white/6 text-primary placeholder-on-surface-variant/50 font-body-md text-body-md p-3 w-full outline-none transition-all duration-300"
                id="email"
                name="email"
                placeholder="Enter secure address"
                required={true}
                type="email"
              />
            </div>
          </div>
          {/* <!-- Subject Input --> */}
          <div className="flex flex-col gap-2 relative group">
            <label
              className="font-label-caps text-label-caps text-on-surface-variant"
              id="subject"
            >
              Transmission Subject
            </label>
            <input
              className="bg-white/2 border-0 border-b border-white/20 focus:ring-0 focus:border-secondary focus:bg-white/6 text-primary placeholder-on-surface-variant/50 font-body-md text-body-md p-3 w-full outline-none transition-all duration-300"
              id="subject"
              name="subject"
              placeholder="State primary intent"
              required={true}
              type="text"
            />
          </div>
          {/* <!-- Message Input --> */}
          <div className="flex flex-col gap-2 relative group">
            <label
              className="font-label-caps text-label-caps text-on-surface-variant"
              id="message"
            >
              Payload Data / Message
            </label>
            <textarea
              className="bg-white/2 border-0 border-b border-white/20 focus:ring-0 focus:border-secondary focus:bg-white/6 text-primary placeholder-on-surface-variant/50 font-body-md text-body-md p-3 w-full outline-none transition-all duration-300 resize-none"
              id="message"
              name="message"
              placeholder="Transmit your message parameters here..."
              required={true}
              rows={5}
            />
          </div>
          {/* <!-- Submit Button --> */}
          <div className="pt-4 flex justify-end">
            <button
              className="bg-primary text-surface font-label-caps text-label-caps py-4 px-10 rounded flex items-center justify-center gap-3 hover:bg-white/90 active:scale-95 transition-all duration-300 group"
              type="submit"
              aria-disabled={pending}
            >
              Initiate Transfer
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                send
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
