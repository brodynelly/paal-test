import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)", 
  "/admin(.*)",
  "/settings(.*)",
  "/profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const ignoredRoutes = [
    "/api/socket.io/(.*)",
    "/socket.io/(.*)",
    "/_next/webpack-hmr",
  ];

  if (ignoredRoutes.some((route) => req.nextUrl.pathname.match(new RegExp(route)))) {
    return;
  }

  

  const publicRoutes = ["/", "/sign-in", "/sign-up"];
  
  // Wait for auth() to resolve
  const { userId, redirectToSignIn } = await auth();

  // Redirect unauthenticated users if they try to access protected routes
  if (!userId && isProtectedRoute(req) && !publicRoutes.includes(req.nextUrl.pathname)) {
    return redirectToSignIn();
  }
}, 
{ 
} 
);

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
