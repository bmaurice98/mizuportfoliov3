import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_PORTFOLIO_PORTFOLIO_INQURIESSUPABASE_URL!,
    process.env
      .NEXT_PUBLIC_SUPABASE_PORTFOLIO_PORTFOLIO_INQURIESSUPABASE_PUBLISHABLE_KEY!,
  );
}
