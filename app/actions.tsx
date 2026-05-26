"use server";

import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

export async function createInquiry(formData: FormData) {
  try {
    const supabase = await createClient();

    const rawFormData = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    if(!formData) return{error: 'Invalid form data'}

    const {error} = await supabase.from('inquiries').insert(rawFormData)

    if (error) {
      console.error("Error inserting form data:", error.message);
      return { error: "Failed to create inquiry" };
    }

    revalidatePath('/contact')

    // return { status: 200, payload: rawFormData };
  } catch (error) {
    throw new Error(
      "There was a problem sending the inquiry. \nError: " + error,
    );
  }
}
