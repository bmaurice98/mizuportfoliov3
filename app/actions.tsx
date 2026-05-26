'use server'

export async function createInquiry(formData:FormData) {
    try {
    const rawFormData = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };    
    
    // return { status: 200, payload: rawFormData };
    } catch (error) {
        throw new Error("There was a problem sending the inquiry. \nError: " + error )
    }
    

    
}