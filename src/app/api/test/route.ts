export async function GET(request: Request) {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  return new Response(JSON.stringify(data.slice(0, 5)), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
