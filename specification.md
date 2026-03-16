Requirements for URL shortener (backend)

Funtional Requirements
1. Users can create short urls and be redirected to the original long url when they access the short url.
	1.1 Users can specify an optional alias
	1.2 Users may not specify an optional alias
		- 1.2.1 System should generate a unique alias if users does not provide one
	1.3 The aliases (specified or otherwise) should not overlap with each other.
		- Short URLs are valid for 90 days for unauthenticated users. (Will implement premium authenticated features later)
	1.4 Forbidden short-urls
		- '/'
		- '/api'

Non-Functional Requirements
1. Datastores for storing short urls
	- MySQL
	- Does not have TTL but same functionality can be achieved using scheduled events
	- Perform cleanup at 2 AM (Bangladesh Time)
2. When storing long urls
	- Users may or may not prepend protocol: http:// or https://
	- If it's not specified, default to 'https://' and start a HEAD request (performance bottlekneck that will have to be addressed later)
		- If the HEAD request fails, fall back to http and if it succeeds, proceed to storing the URL with https. 
3. Redirect operation
	- We are going to use express res.redirect(code, url) function
	- HTTP Status: 308 (permanent redirect) 
		- For testing and development purposes, set the Cache-Control header to no-store. // 'Cache-Control', 'no-store, no-cache, must-revalidate'
		- For productions, set public, max-age=3600 (1 hour)

Code base rules
1. Use snake-case for variables
2. Use '-' for seperating words in URL

Backend Routes
- Route: '/' (Root)
	- HTTP Method: GET
	- Should server my frontend static html, css and Javascript files.

- Route: '/api/shorten-url'
	- HTTP Method: POST
	- Should accept two types of input
		- Input with optional body attribute called 'alias'
		- Input without optional 'alias' body attribute
	- Upon sucessful completion, this endpoint to should return
		- A "message" with "URL creation successful"
		- The "short_url" itself

- Route: '/:short-alias'
	- HTTP Method: GET
	- Redirection logic
		- Check if short-alias is available in the datastore
		- Retrieve the long_url 
		- Redirect to long_url

