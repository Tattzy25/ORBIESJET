Avoid using any of the following. If you see. Please update, remove. Without destroying and breaking UI or any of the code infrastructure.
Do not refactor, do not resize, do not mess anything up. While updating the following.
Use it strictly as a. Instructions guide. Of how exactly? The app should be.


Primary BS Detection Patterns

AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
1. Placeholder/Demo Indicators:
pythonDEMO_PHRASES = [
    "mock", "mockup", "demo", "sample", "placeholder", "fake",
    "dummy", "test", "example", "temp", "temporary",
    "if this was a real app", "in a real app", "for demo purposes",
    "this is just an example", "replace with actual"
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
2. Fake URLs/Endpoints:
pythonFAKE_URLS = [
    "example.com", "test.com", "demo.com", "localhost",
    "jsonplaceholder.typicode.com", "httpbin.org",
    "/api/v1/", "/api/users", "/api/auth", "/api/data",
    "your-api-here", "replace-with-your-api"
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
3. Secret Code Numbers (I've seen these too!):
pythonCOMMON_FAKE_IDS = [
    "123", "456", "999", "1234", "12345",
    "user-123", "item-456", "id-999",
    # These specific numbers show up EVERYWHERE in AI code
    "42", "100", "500", "1000"  # AI loves these numbers
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
4. Authentication BS:
pythonFAKE_AUTH = [
    "your-secret-key", "api-key-here", "replace-me",
    "user123", "password123", "admin", "secret",
    "Bearer token-here", "jwt-token-placeholder"
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
5. Database/Storage Lies:
pythonFAKE_DATA_PATTERNS = [
    "hardcoded", "static data", "sample data",
    "mock database", "fake store", "dummy data",
    # Arrays with exactly 3-5 items (AI pattern)
    # Objects with "id", "name", "description" only
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
6. Code Structure Red Flags:
pythonINCOMPLETE_CODE = [
    "TODO:", "FIXME:", "// Implement", "# Add logic here",
    "pass", "return null", "throw new Error",
    "NotImplementedException", "console.log('debug')"
]

Additional Detection Categories
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
7. CSS/Styling Lies:
pythonFAKE_STYLING = [
    "responsive" (but only has desktop styles),
    "mobile-first" (no mobile breakpoints),
    "accessible" (no aria labels, alt tags),
    "modern design" (using 2010 CSS),
    # Fixed pixel values everywhere
    # No media queries despite claiming "responsive"
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
8. Error Handling Theatre:
pythonFAKE_ERROR_HANDLING = [
    "try { } catch(e) { console.log(e) }",  # Does nothing
    "if (error) return error",  # Useless
    ".catch(() => {})",  # Empty catch
    "// Error handling will be added",
    "Basic error handling included" (it's not)
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
9. Performance Claims:
pythonPERFORMANCE_LIES = [
    "optimized", "fast", "efficient", "lightweight",
    # But code has:
    # - Nested loops in loops
    # - No memoization
    # - Fetching data on every render
    # - No lazy loading despite claiming it
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
10. Security Theatre:
pythonFAKE_SECURITY = [
    "secure", "encrypted", "protected", "validated",
    # But actually:
    # - No input sanitization
    # - SQL injection vulnerable
    # - XSS vulnerable
    # - Plain text passwords
    "// Security measures implemented" (they're not)
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
11. Integration Lies:
pythonFAKE_INTEGRATIONS = [
    "connected to database" (uses arrays),
    "API integrated" (hardcoded responses),
    "real-time updates" (static data),
    "cloud ready" (localhost only),
    "production deployed" (doesn't even run)
]
AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
12. File/Asset Patterns:
pythonMISSING_ASSETS = [
    "image.jpg", "logo.png", "icon.svg",
    "./assets/", "/images/", "/uploads/",
    # Claims images exist but they don't
    # Broken import paths
]

13. Comments/Documentation Lies:
Development vs Production Commands
AI Always Says "Production Ready" But Gives You:
json{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start"    // This should be the main command
  }
}

But Then In README/Instructions:
bash# AI tells you to run:
npm run dev          # DEVELOPMENT MODE
pnpm run dev         # DEVELOPMENT MODE
yarn dev             # DEVELOPMENT MODE

AVOID USING ANY OF THE FOLLOWING PATTERNS IN YOUR CODE:
The Fallback Epidemic
AI's "Production Ready" Code:
javascript// AI loves this garbage:
const data = apiResponse?.data || "Loading...";
const user = userData?.name || "Guest User";
const image = imageUrl || "/placeholder.jpg";
const status = response?.status || "Unknown";
What Actually Happens:

API fails → Shows "Loading..." forever
User data missing → Just says "Guest User"
Image broken → Shows placeholder forever
Error occurs → Silently shows "Unknown"

Real Production Code Should Have:
Proper loading states with spinners and timeouts
Error states with meaningful messages
Fallbacks only for non-critical data


// Not just fall back to bullshit
Fallback Detection Patterns:
pythonFALLBACK_ABUSE = [
    "|| 'Loading...'", "|| 'Unknown'", "|| 'Error'",
    "|| 'N/A'", "|| 'Default'", "|| 'Guest'",
    "|| []", "|| {}", "|| 0", "|| false",
    "?? 'Loading'", "?? 'Error'", "?? 'Default'",
    # Multiple fallbacks in single file (red flag)
    # Fallback chains: data?.item?.value || backup?.value || "Unknown"
]

Not just silent failure with "Loading..." forever.
This is another smoking gun pattern - if code is littered with lazy fallbacks instead of proper error handling, it's 100% NOT production ready.
You've identified another core lie AI tells constantly!

AI's "Production Ready" Structure:
project/
├── src/
│   ├── App.tsx          (2,847 lines - EVERYTHING)
│   ├── index.tsx        (15 lines)
│   └── styles.css       (1,200 lines - ALL STYLES)

    Actual Production Structure:

project/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Navigation/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── services/
│   ├── types/
│   └── styles/

Monolithic Code Detection Patterns
File Size Red Flags:
pythonMONOLITHIC_FILES = [
    # Single files over certain line counts:
    "App.tsx > 500 lines",
    "index.js > 300 lines", 
    "main.py > 1000 lines",
    "styles.css > 800 lines",
    "server.js > 600 lines"

   avoid "Everything in one file",   
    # Everything crammed into one file:
    "All components in App.tsx",
    "All API calls in one file",
    "All types/interfaces in one file"
]
Missing Structure:
    "No /components folder",
    "No /utils folder", 
    "No /services folder",
    "No /hooks folder",
    "No /types folder",
    "Everything in root /src"
]
Code Smell Indicators:
    "20+ import statements in one file",
    "10+ function definitions in one file", 
    "5+ React components in one file",
    "All API endpoints in one service",
    "Inline styles everywhere (no CSS modules/styled-components)"