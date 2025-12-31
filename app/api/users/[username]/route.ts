export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    console.log(`Fetching user: ${username}`);
    
    const response = await fetch(
      `http://localhost:8000/api/users/${username}`,
      { cache: 'no-store' }
    );
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Error: ${error}`);
      return Response.json(
        { error: "User not found" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`User data:`, data);
    return Response.json(data);
  } catch (error) {
    console.error(`Fetch error:`, error);
    return Response.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
