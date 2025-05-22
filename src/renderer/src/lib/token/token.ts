export async function getAuthToken(user_id: string) {
    const res = await fetch(`${import.meta.env.VITE_WS_PORT}/auth/holovue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
    });

    const data = await res.json();
    return data.token;
}