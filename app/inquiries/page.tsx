import InquiriesCard from "@/components/inquiries/inquiriesCard";
import InquiriesHeader from "@/components/inquiries/inquiriesHeader";
import Navbar from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import React from "react";

export default async function page() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase.from("inquiries").select();
  // console.log(typeof inquiries);
  // console.log( inquiries);
  
  return (
    <>
      <Navbar />
      <div className="grow pt-15 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <InquiriesHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {inquiries?.map((data) => (
            <InquiriesCard {...data} key={data.id}/>
          ))}
        </div>
      </div>
    </>
  );
}
