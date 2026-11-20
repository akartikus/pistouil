/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// Keeps the files of the application itself, so that it starts without a connection.
// The game data and the tiles are never cached here: offline zones live in the zone store.
import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `app-${version}`;
// Manifest paths are relative to the base path, which is the scope of the worker.
const path = (file: string) => new URL(file, sw.registration.scope).pathname;
// The single page of the application (adapter-static fallback), and every built or static file.
// static/dev-data holds the development data (hundreds of megabytes): never the application.
const ASSETS = [
	path(''),
	...[...immutable, ...assets, ...prerendered]
		.map((file) => path(file.path))
		.filter((file) => !file.includes('/dev-data/'))
];

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
			)
	);
});

sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	if (url.origin !== sw.location.origin) return;
	const asset = ASSETS.includes(url.pathname);
	// Every page is the same single page application (adapter-static fallback).
	const page = event.request.mode === 'navigate';
	if (!asset && !page) return;
	event.respondWith(
		caches.open(CACHE).then(async (cache) => {
			if (asset) return (await cache.match(url.pathname)) ?? fetch(event.request);
			try {
				return await fetch(event.request);
			} catch {
				return (await cache.match(path(''))) ?? Response.error();
			}
		})
	);
});
