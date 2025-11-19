export default {
	// Set cache headers for static assets
	routeRules: {
		// Cache hashed assets for 1 year (they have content hashes in filenames)
		"/assets/**": {
			headers: {
				"cache-control": "public, max-age=31536000, immutable",
			},
		},
		// Don't cache the HTML pages (they need to be fresh to load new asset versions)
		"/**": {
			headers: {
				"cache-control": "public, max-age=0, must-revalidate",
			},
		},
	},
	compatibilityDate: "2025-11-18",
};
