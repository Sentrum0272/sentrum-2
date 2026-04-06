async function requireAdminAuth() {
  const supabase = window.supabaseClient;
  if (!supabase) {
    console.error("Supabase client 未載入");
    window.location.href = "./login.html";
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    window.location.href = "./login.html";
    return null;
  }

  return data.session;
}

window.AdminAuth = {
  requireAdminAuth
};