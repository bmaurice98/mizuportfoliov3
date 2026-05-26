
import ContactForm from "@/components/contactPage/contactForm";
import ContactHeader from "@/components/contactPage/contactHeader";
import SocialGraph from "@/components/contactPage/socialGraph";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React from "react";

function page() {
  return (
    <>
      <Navbar />
      <div className="grow pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <ContactHeader />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <SocialGraph />
          <ContactForm />
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}

export default page;
