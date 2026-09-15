=== Genfinity API Bridge ===
Contributors: genfinity
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Secure API bridge for approved Genfinity content integrations.

== Installation ==
1. In WordPress Admin, open Plugins > Add New > Upload Plugin.
2. Upload genfinity-api-bridge.zip and activate it.
3. Open Settings > Genfinity API Bridge.
4. Copy the generated API key to your trusted integration configuration.

== Authentication ==
Send the API key in the X-Genfinity-API-Key header. Never publish or commit this key.

== Endpoints ==
GET /wp-json/genfinity/v1/health
POST /wp-json/genfinity/v1/posts
POST /wp-json/genfinity/v1/media (multipart field: file)

Posts default to draft status. Use publish only when publication is explicitly intended.
